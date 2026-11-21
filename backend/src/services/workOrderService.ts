import { withTransaction } from '../db/transaction.js';
import { clock } from '../config/clock.js';
import {
  appointmentRepository,
  vehicleRepository,
  mechanicRepository,
  serviceRepository,
  workOrderRepository,
  workOrderStatusHistoryRepository,
  diagnosticRepository,
  workOrderItemRepository,
  partRepository,
  inventoryMovementRepository,
  partReservationRepository,
} from '../repositories/index.js';
import type { WorkOrder, WorkOrderStatus, Appointment } from '../models/index.js';

const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  RECEIVED: ['DIAGNOSIS', 'CANCELLED'],
  DIAGNOSIS: ['WAITING_APPROVAL', 'CANCELLED'],
  WAITING_APPROVAL: ['WAITING_PARTS', 'IN_PROGRESS', 'CANCELLED'],
  WAITING_PARTS: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export class WorkOrderService {
  async list(filter?: {
    customerId?: string;
    mechanicId?: string;
    status?: WorkOrderStatus;
  }): Promise<WorkOrder[]> {
    return workOrderRepository.list(filter);
  }

  async getById(id: string): Promise<WorkOrder> {
    const order = await workOrderRepository.findById(id);
    if (!order) {
      const err: any = new Error('Orden de trabajo no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return order;
  }

  /**
   * Crea una orden de trabajo desde un turno confirmado (R-021).
   * Valida kilometraje no regresivo (R-007) y especialidad del mecanico (R-012).
   * Marca el turno como CONVERTED_TO_WORK_ORDER.
   */
  async createFromAppointment(data: {
    appointmentId: string;
    mechanicId: string;
    mileageIn: number;
    problem: string;
    observations?: string | null;
    changedBy: string;
  }): Promise<WorkOrder> {
    const appointment = await appointmentRepository.findById(data.appointmentId);
    if (!appointment) {
      const err: any = new Error('Turno no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (appointment.status !== 'CONFIRMED') {
      const err: any = new Error('Solo se puede crear orden desde un turno CONFIRMED');
      err.statusCode = 400;
      throw err;
    }

    const vehicle = await vehicleRepository.findById(appointment.vehicle_id);
    if (!vehicle) {
      const err: any = new Error('Vehiculo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    // Kilometraje no regresivo (R-007)
    const lastMileage = vehicle.mileage;
    if (data.mileageIn < lastMileage) {
      const err: any = new Error(`El kilometraje de ingreso no puede ser menor al ultimo documentado (${lastMileage})`);
      err.statusCode = 409;
      throw err;
    }

    const mechanic = await mechanicRepository.findById(data.mechanicId);
    if (!mechanic || !mechanic.active) {
      const err: any = new Error('Mecanico no disponible');
      err.statusCode = 404;
      throw err;
    }
    const service = await serviceRepository.findById(appointment.service_id);
    if (!service) {
      const err: any = new Error('Servicio no encontrado');
      err.statusCode = 404;
      throw err;
    }
    const mechanicServiceIds = await mechanicRepository.findServiceIds(data.mechanicId);
    if (!mechanicServiceIds.includes(appointment.service_id)) {
      const err: any = new Error('El mecanico no tiene la especialidad para este servicio');
      err.statusCode = 400;
      throw err;
    }

    let result!: WorkOrder;
    await withTransaction(workOrderRepository.db, async (tx) => {
      const created = await workOrderRepository.create(
        {
          customerId: appointment.customer_id,
          vehicleId: appointment.vehicle_id,
          appointmentId: appointment.id,
          mechanicId: data.mechanicId,
          bayId: appointment.bay_id ?? null,
          mileageIn: data.mileageIn,
          status: 'RECEIVED',
          problem: data.problem,
          observations: data.observations ?? null,
        },
        tx as any
      );

      // Historial de kilometraje
      await tx.query(
        `INSERT INTO vehicle_mileage_history (vehicle_id, mileage, recorded_by)
         VALUES ($1, $2, $3)`,
        [appointment.vehicle_id, data.mileageIn, data.changedBy]
      );

      // Historial de estados (R-024)
      await workOrderStatusHistoryRepository.create(
        {
          workOrderId: created.id,
          fromStatus: null,
          toStatus: 'RECEIVED',
          changedBy: data.changedBy,
          notes: 'Orden creada desde turno',
        },
        tx as any
      );

      // Turno pasa a convertido (R-020)
      await appointmentRepository.update(appointment.id, { status: 'CONVERTED_TO_WORK_ORDER' }, tx as any);

      result = created;
    });
    return result;
  }

  /**
   * Mecanico registra diagnostico (R-022). Solo el mecanico asignado.
   * Transicion RECEIVED -> DIAGNOSIS.
   */
  async registerDiagnostic(data: {
    workOrderId: string;
    mechanicId: string;
    identifiedProblem: string;
    observations?: string | null;
    possibleCauses?: string | null;
    recommendedRepairs?: string | null;
    priority?: string;
    changedBy: string;
  }): Promise<{ diagnostic: any; workOrder: WorkOrder }> {
    const order = await workOrderRepository.findById(data.workOrderId);
    if (!order) {
      const err: any = new Error('Orden de trabajo no encontrada');
      err.statusCode = 404;
      throw err;
    }
    if (order.mechanic_id !== data.mechanicId) {
      const err: any = new Error('La orden no esta asignada a este mecanico');
      err.statusCode = 403;
      throw err;
    }

    let result!: any;
    await withTransaction(workOrderRepository.db, async (tx) => {
      const diagnostic = await diagnosticRepository.create(
        {
          workOrderId: data.workOrderId,
          mechanicId: data.mechanicId,
          identifiedProblem: data.identifiedProblem,
          observations: data.observations ?? null,
          possibleCauses: data.possibleCauses ?? null,
          recommendedRepairs: data.recommendedRepairs ?? null,
          priority: data.priority ?? 'MEDIA',
        },
        tx as any
      );

      const updated = await this.transition(data.workOrderId, 'DIAGNOSIS', data.changedBy, 'Diagnostico registrado', tx as any);
      result = { diagnostic, workOrder: updated };
    });
    return result;
  }

  /**
   * Cambia el estado de una orden con trazabilidad (R-023, R-024).
   * No permite RECEIVED -> COMPLETED directo.
   */
  async transition(
    workOrderId: string,
    toStatus: WorkOrderStatus,
    changedBy: string,
    notes?: string | null,
    tx?: any
  ): Promise<WorkOrder> {
    const order = await workOrderRepository.findById(workOrderId);
    if (!order) {
      const err: any = new Error('Orden de trabajo no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(toStatus)) {
      const err: any = new Error(`Transicion invalida: ${order.status} -> ${toStatus}`);
      err.statusCode = 400;
      throw err;
    }

    const run = async (db: any) => {
      await workOrderStatusHistoryRepository.create(
        {
          workOrderId,
          fromStatus: order.status,
          toStatus,
          changedBy,
          notes: notes ?? null,
        },
        db
      );
      const updated = await workOrderRepository.update(workOrderId, { status: toStatus }, db);
      if (!updated) {
        const err: any = new Error('Orden de trabajo no encontrada');
        err.statusCode = 404;
        throw err;
      }
      return updated;
    };

    if (tx) return run(tx);

    let result!: WorkOrder;
    await withTransaction(workOrderRepository.db, async (t) => {
      result = await run(t as any);
    });
    return result;
  }

  /**
   * Entrega del vehiculo (R-037): READY_FOR_PICKUP -> COMPLETED.
   * Registra kilometraje final y actualiza el vehiculo.
   */
  async deliver(data: {
    workOrderId: string;
    mileageOut: number;
    changedBy: string;
    observations?: string | null;
  }): Promise<WorkOrder> {
    const order = await workOrderRepository.findById(data.workOrderId);
    if (!order) {
      const err: any = new Error('Orden de trabajo no encontrada');
      err.statusCode = 404;
      throw err;
    }
    if (order.status !== 'READY_FOR_PICKUP') {
      const err: any = new Error('La orden debe estar READY_FOR_PICKUP para entregar');
      err.statusCode = 400;
      throw err;
    }
    if (data.mileageOut < order.mileage_in) {
      const err: any = new Error('El kilometraje final no puede ser menor al de ingreso');
      err.statusCode = 400;
      throw err;
    }

    let result!: WorkOrder;
    await withTransaction(workOrderRepository.db, async (tx) => {
      const updated = await workOrderRepository.update(
        data.workOrderId,
        {
          status: 'COMPLETED',
          mileageOut: data.mileageOut,
          deliveredAt: clock.now(),
          observations: data.observations ?? null,
        },
        tx as any
      );
      if (!updated) {
        const err: any = new Error('Orden de trabajo no encontrada');
        err.statusCode = 404;
        throw err;
      }

      await workOrderStatusHistoryRepository.create(
        {
          workOrderId: data.workOrderId,
          fromStatus: 'READY_FOR_PICKUP',
          toStatus: 'COMPLETED',
          changedBy: data.changedBy,
          notes: 'Entrega de vehiculo',
        },
        tx as any
      );

      await vehicleRepository.update(order.vehicle_id, { mileage: data.mileageOut }, tx as any);
      await tx.query(
        `INSERT INTO vehicle_mileage_history (vehicle_id, mileage, recorded_by)
         VALUES ($1, $2, $3)`,
        [order.vehicle_id, data.mileageOut, data.changedBy]
      );

      result = updated as WorkOrder;
    });
    return result;
  }

  async cancelWorkOrder(workOrderId: string, changedBy: string): Promise<WorkOrder> {
    const order = await workOrderRepository.findById(workOrderId);
    if (!order) {
      const err: any = new Error('Orden de trabajo no encontrada');
      err.statusCode = 404;
      throw err;
    }
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      const err: any = new Error('La orden no se puede cancelar en su estado actual');
      err.statusCode = 400;
      throw err;
    }

    let result!: WorkOrder;
    await withTransaction(workOrderRepository.db, async (tx) => {
      const updated = await workOrderRepository.update(workOrderId, { status: 'CANCELLED' }, tx as any);
      if (!updated) {
        const err: any = new Error('Orden de trabajo no encontrada');
        err.statusCode = 404;
        throw err;
      }

      await workOrderStatusHistoryRepository.create(
        {
          workOrderId,
          fromStatus: order.status,
          toStatus: 'CANCELLED',
          changedBy,
          notes: 'Orden cancelada',
        },
        tx as any
      );

      // Liberar reservas no consumidas (R-035)
      await partReservationRepository.releaseNonConsumedByWorkOrder(workOrderId, tx as any);
      const reservations = await partReservationRepository.listByWorkOrder(workOrderId, tx as any);
      for (const res of reservations) {
        if (res.status === 'released') {
          const part = await partRepository.lock(res.part_id, tx as any);
          if (part) {
            await partRepository.update(
              part.id,
              { quantityAvailable: part.quantity_available + res.quantity },
              tx as any
            );
            await inventoryMovementRepository.create(
              {
                partId: res.part_id,
                type: 'liberacion',
                quantity: res.quantity,
                referenceType: 'part_reservation',
                referenceId: res.id,
                userId: changedBy,
              },
              tx as any
            );
          }
        }
      }

      result = updated as WorkOrder;
    });
    return result;
  }
}

export const workOrderService = new WorkOrderService();

