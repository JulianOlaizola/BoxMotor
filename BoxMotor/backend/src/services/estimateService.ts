import { withTransaction } from '../db/transaction.js';
import { clock } from '../config/clock.js';
import { env } from '../config/env.js';
import {
  workOrderRepository,
  estimateRepository,
  estimateItemRepository,
  estimateVersionRepository,
  partRepository,
  inventoryMovementRepository,
  partReservationRepository,
} from '../repositories/index.js';
import type { Estimate, EstimateItem } from '../models/index.js';

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

export class EstimateService {
  async list(filter?: {
    workOrderId?: string;
    customerId?: string;
    status?: Estimate['status'];
  }): Promise<Estimate[]> {
    return estimateRepository.list(filter);
  }

  async getById(id: string): Promise<Estimate> {
    const estimate = await estimateRepository.findById(id);
    if (!estimate) {
      const err: any = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return estimate;
  }

  async getItems(estimateId: string, version: number): Promise<EstimateItem[]> {
    return estimateItemRepository.listByEstimate(estimateId, version);
  }

  /**
   * Crea un presupuesto con precios historicos copiados al momento (R-025, R-029).
   * Vigencia = emision + ESTIMATE_VALIDITY_DAYS (configurable, R-028).
   */
  async create(data: {
    workOrderId: string;
    customerId: string;
    laborTotal: number;
    notes?: string | null;
    issuedAt?: Date;
    items: { partId: string; quantity: number }[];
  }): Promise<{ estimate: Estimate; items: EstimateItem[] }> {
    const workOrder = await workOrderRepository.findById(data.workOrderId);
    if (!workOrder) {
      const err: any = new Error('Orden de trabajo no encontrada');
      err.statusCode = 404;
      throw err;
    }
    if (workOrder.customer_id !== data.customerId) {
      const err: any = new Error('La orden no pertenece a ese cliente');
      err.statusCode = 403;
      throw err;
    }

    const issuedAt = data.issuedAt ?? clock.now();
    const validityDays = env.ESTIMATE_VALIDITY_DAYS;
    const expiresAt = addDays(issuedAt, validityDays);

    // Ultima version para esta orden
    const latest = await estimateRepository.findByWorkOrder(data.workOrderId);
    const version = latest ? latest.version + 1 : 1;

    // Resolver precios historicos de los repuestos (R-029)
    const resolvedItems: { partId: string; quantity: number; unitPrice: number; subtotal: number }[] = [];
    let partsTotal = 0;
    for (const item of data.items) {
      const part = await partRepository.findById(item.partId);
      if (!part || !part.active) {
        const err: any = new Error(`Reparto ${item.partId} no encontrado o inactivo`);
        err.statusCode = 404;
        throw err;
      }
      const unitPrice = part.price;
      const subtotal = unitPrice * item.quantity;
      partsTotal += subtotal;
      resolvedItems.push({ partId: item.partId, quantity: item.quantity, unitPrice, subtotal });
    }

    const laborTotal = data.laborTotal;
    const total = laborTotal + partsTotal;

    let result!: { estimate: Estimate; items: EstimateItem[] };
    await withTransaction(workOrderRepository.db, async (tx) => {
      const estimate = await estimateRepository.create(
        {
          workOrderId: data.workOrderId,
          version,
          laborTotal,
          partsTotal,
          total,
          status: 'PENDING',
          issuedAt,
          expiresAt,
          notes: data.notes ?? null,
          customerId: data.customerId,
        },
        tx as any
      );

      const createdItems: EstimateItem[] = [];
      for (const item of resolvedItems) {
        const created = await estimateItemRepository.create(
          {
            estimateId: estimate.id,
            version,
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          },
          tx as any
        );
        createdItems.push(created);
      }

      await estimateVersionRepository.createEstimateVersion(
        { estimateId: estimate.id, version, total, status: 'PENDING', issuedAt },
        tx as any
      );

      result = { estimate, items: createdItems };
    });
    return result;
  }

  /**
   * Cliente aprueba el presupuesto (R-026).
   * Solo el cliente dueÃ±o, no vencido, estado PENDING/SENT.
   * Pasa la orden a WAITING_PARTS e intenta reservar repuestos (R-033).
   */
  async approve(estimateId: string, customerId: string): Promise<{ estimate: any; workOrder: any }> {
    const estimate = await estimateRepository.findById(estimateId);
    if (!estimate) {
      const err: any = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (estimate.customer_id !== customerId) {
      const err: any = new Error('El presupuesto no pertenece a este cliente');
      err.statusCode = 403;
      throw err;
    }
    if (estimate.status !== 'PENDING' && estimate.status !== 'SENT') {
      const err: any = new Error('Solo se pueden aprobar presupuestos PENDING o SENT');
      err.statusCode = 400;
      throw err;
    }
    if (clock.now() > estimate.expires_at) {
      const err: any = new Error('Presupuesto vencido');
      err.statusCode = 400;
      throw err;
    }

    const items = await estimateItemRepository.listByEstimate(estimateId, estimate.version);

    let result!: any;
    await withTransaction(workOrderRepository.db, async (tx) => {
      const updatedEstimate = await estimateRepository.update(
        estimateId,
        { status: 'APPROVED' },
        tx as any
      );
      if (!updatedEstimate) {
        const err: any = new Error('Presupuesto no encontrado');
        err.statusCode = 404;
        throw err;
      }

      // Reservar repuestos (R-033). Stock insuficiente -> 409 con faltantes.
      const missing: string[] = [];
      for (const item of items) {
        const part = await partRepository.lock(item.part_id, tx as any);
        if (!part) {
          missing.push(item.part_id);
          continue;
        }
        if (part.quantity_available < item.quantity) {
          missing.push(part.code);
          continue;
        }
        await partRepository.update(
          part.id,
          { quantityAvailable: part.quantity_available - item.quantity },
          tx as any
        );
        await partReservationRepository.create(
          {
            estimateId,
            workOrderId: estimate.work_order_id,
            partId: item.part_id,
            quantity: item.quantity,
            status: 'reserved',
          },
          tx as any
        );
        await inventoryMovementRepository.create(
          {
            partId: item.part_id,
            type: 'reserva',
            quantity: item.quantity,
            referenceType: 'estimate',
            referenceId: estimate.id,
            userId: customerId,
          },
          tx as any
        );
      }

      if (missing.length) {
        // No hay stock suficiente: revertir se maneja por el throw + rollback
        const err: any = new Error('Stock insuficiente para reservar todos los repuestos');
        err.statusCode = 409;
        err.missing = missing;
        throw err;
      }

      // Orden pasa a WAITING_PARTS (o IN_PROGRESS si no hay repuestos)
      const nextStatus = items.length ? 'WAITING_PARTS' : 'IN_PROGRESS';
      const workOrder = await workOrderRepository.update(
        estimate.work_order_id,
        { status: nextStatus },
        tx as any
      );

      result = { estimate: updatedEstimate, workOrder };
    });
    return result;
  }

  /**
   * Cliente rechaza el presupuesto (R-026).
   */
  async reject(estimateId: string, customerId: string): Promise<{ estimate: any }> {
    const estimate = await estimateRepository.findById(estimateId);
    if (!estimate) {
      const err: any = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (estimate.customer_id !== customerId) {
      const err: any = new Error('El presupuesto no pertenece a este cliente');
      err.statusCode = 403;
      throw err;
    }
    if (estimate.status !== 'PENDING' && estimate.status !== 'SENT') {
      const err: any = new Error('Solo se pueden rechazar presupuestos PENDING o SENT');
      err.statusCode = 400;
      throw err;
    }
    const updated = await estimateRepository.update(estimateId, { status: 'REJECTED' });
    if (!updated) {
      const err: any = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return { estimate: updated };
  }

  /**
   * Nueva version del presupuesto (R-027). La version anterior queda historica
   * y la autorizacion previa queda invalida; el estado vuelve a PENDING.
   */
  async newVersion(data: {
    estimateId: string;
    customerId: string;
    laborTotal: number;
    notes?: string | null;
    items: { partId: string; quantity: number }[];
    issuedAt?: Date;
  }): Promise<{ estimate: any; items: EstimateItem[] }> {
    const estimate = await estimateRepository.findById(data.estimateId);
    if (!estimate) {
      const err: any = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (estimate.customer_id !== data.customerId) {
      const err: any = new Error('El presupuesto no pertenece a este cliente');
      err.statusCode = 403;
      throw err;
    }

    const issuedAt = data.issuedAt ?? clock.now();
    const expiresAt = addDays(issuedAt, env.ESTIMATE_VALIDITY_DAYS);
    const version = estimate.version + 1;

    const resolvedItems: { partId: string; quantity: number; unitPrice: number; subtotal: number }[] = [];
    let partsTotal = 0;
    for (const item of data.items) {
      const part = await partRepository.findById(item.partId);
      if (!part || !part.active) {
        const err: any = new Error(`Repuesto ${item.partId} no encontrado o inactivo`);
        err.statusCode = 404;
        throw err;
      }
      const unitPrice = part.price;
      const subtotal = unitPrice * item.quantity;
      partsTotal += subtotal;
      resolvedItems.push({ partId: item.partId, quantity: item.quantity, unitPrice, subtotal });
    }

    const laborTotal = data.laborTotal;
    const total = laborTotal + partsTotal;

    let result!: any;
    await withTransaction(workOrderRepository.db, async (tx) => {
      const updated = await estimateRepository.update(
        data.estimateId,
        { version, laborTotal, partsTotal, total, status: 'PENDING', issuedAt, expiresAt, notes: data.notes ?? null },
        tx as any
      );
      if (!updated) {
        const err: any = new Error('Presupuesto no encontrado');
        err.statusCode = 404;
        throw err;
      }

      const createdItems: EstimateItem[] = [];
      for (const item of resolvedItems) {
        const created = await estimateItemRepository.create(
          {
            estimateId: data.estimateId,
            version,
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          },
          tx as any
        );
        createdItems.push(created);
      }

      await estimateVersionRepository.createEstimateVersion(
        { estimateId: data.estimateId, version, total, status: 'PENDING', issuedAt },
        tx as any
      );

      result = { estimate: updated, items: createdItems };
    });
    return result;
  }
}

export const estimateService = new EstimateService();

