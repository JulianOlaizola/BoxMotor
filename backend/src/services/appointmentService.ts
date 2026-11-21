import { withTransaction } from '../db/transaction.js';
import { clock } from '../config/clock.js';
import { env } from '../config/env.js';
import {
  appointmentRepository,
  mechanicRepository,
  bayRepository,
  vehicleRepository,
  serviceRepository,
  workshopHoursRepository,
} from '../repositories/index.js';
import type { Appointment } from '../models/index.js';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'] as const;

/** Minutos entre slots generados en disponibilidad. */
const SLOT_STEP_MIN = 30;

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function isWithinAnticipationWindow(startsAt: Date): { ok: boolean; reason?: string } {
  const now = clock.now();
  const minStart = addMinutes(now, env.MIN_ANTICIPATION_HOURS * 60);
  const maxStart = addMinutes(now, env.MAX_ANTICIPATION_DAYS * 24 * 60);
  if (startsAt < minStart) {
    return { ok: false, reason: `El turno debe solicitarse con al menos ${env.MIN_ANTICIPATION_HOURS} hs de anticipacion` };
  }
  if (startsAt > maxStart) {
    return { ok: false, reason: `El turno no puede exceder los ${env.MAX_ANTICIPATION_DAYS} dias de horizonte` };
  }
  return { ok: true };
}

function isCancellable(startsAt: Date): boolean {
  const now = clock.now();
  const limit = addMinutes(now, env.CANCELLATION_HOURS * 60);
  return startsAt > limit;
}

export class AppointmentService {
  async list(filter?: { customerId?: string; status?: Appointment['status'] }): Promise<Appointment[]> {
    if (filter?.customerId) {
      return appointmentRepository.listByCustomer(filter.customerId);
    }
    return appointmentRepository.list();
  }

  async getById(id: string): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      const err: any = new Error('Turno no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return appointment;
  }

  async create(data: {
    customerId: string;
    vehicleId: string;
    serviceId: string;
    mechanicId: string;
    bayId: string;
    startsAt: Date;
    endsAt?: Date;
    reason?: string | null;
    problemDescription?: string | null;
  }): Promise<Appointment> {
    // Vehiculo propio (R-015, R-004)
    const vehicle = await vehicleRepository.findById(data.vehicleId);
    if (!vehicle) {
      const err: any = new Error('Vehiculo no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (vehicle.customer_id !== data.customerId) {
      const err: any = new Error('El vehiculo no pertenece al cliente');
      err.statusCode = 403;
      throw err;
    }

    const service = await serviceRepository.findById(data.serviceId);
    if (!service || !service.active) {
      const err: any = new Error('Servicio no disponible');
      err.statusCode = 404;
      throw err;
    }

    const mechanic = await mechanicRepository.findById(data.mechanicId);
    if (!mechanic || !mechanic.active) {
      const err: any = new Error('Mecanico no disponible');
      err.statusCode = 404;
      throw err;
    }
    const mechanicServiceIds = await mechanicRepository.findServiceIds(data.mechanicId);
    if (!mechanicServiceIds.includes(data.serviceId)) {
      const err: any = new Error('El mecanico no tiene esa especialidad');
      err.statusCode = 400;
      throw err;
    }

    const bay = await bayRepository.findById(data.bayId);
    if (!bay || !bay.active) {
      const err: any = new Error('Box no disponible');
      err.statusCode = 404;
      throw err;
    }

    const startsAt = data.startsAt;
    const endsAt = data.endsAt ?? addMinutes(startsAt, service.duration_min);
    if (endsAt <= startsAt) {
      const err: any = new Error('La fecha de fin debe ser posterior al inicio');
      err.statusCode = 400;
      throw err;
    }

    const anticipation = isWithinAnticipationWindow(startsAt);
    if (!anticipation.ok) {
      const err: any = new Error(anticipation.reason);
      err.statusCode = 400;
      throw err;
    }

    let result!: Appointment;
    await withTransaction(appointmentRepository.db, async (tx) => {
      // Bloqueo de filas para serializar asignaciones (R-014, R-017)
      await mechanicRepository.lock(data.mechanicId, tx as any);
      await bayRepository.lock(data.bayId, tx as any);

      const conflicts = await appointmentRepository.findConflicts(
        {
          mechanicId: data.mechanicId,
          bayId: data.bayId,
          startsAt,
          endsAt,
        },
        tx as any
      );
      if (conflicts.length) {
        const err: any = new Error('El mecanico o el box ya tiene un turno en ese intervalo');
        err.statusCode = 409;
        throw err;
      }

      const created = await appointmentRepository.create(
        {
          customerId: data.customerId,
          vehicleId: data.vehicleId,
          serviceId: data.serviceId,
          mechanicId: data.mechanicId,
          bayId: data.bayId,
          startsAt,
          endsAt,
          status: 'PENDING',
          reason: data.reason ?? null,
          problemDescription: data.problemDescription ?? null,
        },
        tx as any
      );
      result = created;
    });
    return result;
  }

  async confirm(id: string, data: { mechanicId?: string | null; bayId?: string | null }): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      const err: any = new Error('Turno no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (appointment.status !== 'PENDING') {
      const err: any = new Error('Solo se pueden confirmar turnos PENDING');
      err.statusCode = 400;
      throw err;
    }

    const mechanicId = data.mechanicId ?? appointment.mechanic_id;
    const bayId = data.bayId ?? appointment.bay_id;

    if (!mechanicId || !bayId) {
      const err: any = new Error('Se requiere asignar mecanico y box');
      err.statusCode = 400;
      throw err;
    }

    const mechanic = await mechanicRepository.findById(mechanicId);
    if (!mechanic || !mechanic.active) {
      const err: any = new Error('Mecanico no disponible');
      err.statusCode = 404;
      throw err;
    }
    const bay = await bayRepository.findById(bayId);
    if (!bay || !bay.active) {
      const err: any = new Error('Box no disponible');
      err.statusCode = 404;
      throw err;
    }

    let result!: Appointment;
    await withTransaction(appointmentRepository.db, async (tx) => {
      await mechanicRepository.lock(mechanicId, tx as any);
      await bayRepository.lock(bayId, tx as any);

      const conflicts = await appointmentRepository.findConflicts(
        { mechanicId, bayId, startsAt: appointment.starts_at, endsAt: appointment.ends_at, excludeId: id },
        tx as any
      );
      if (conflicts.length) {
        const err: any = new Error('El mecanico o el box ya tiene un turno en ese intervalo');
        err.statusCode = 409;
        throw err;
      }

      const updated = await appointmentRepository.update(id, {
        mechanicId,
        bayId,
        status: 'CONFIRMED',
      }, tx as any);
      if (!updated) {
        const err: any = new Error('Turno no encontrado');
        err.statusCode = 404;
        throw err;
      }
      result = updated;
    });
    return result;
  }

  async cancel(id: string, user: { userId: string; role: string }): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      const err: any = new Error('Turno no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW' || appointment.status === 'CONVERTED_TO_WORK_ORDER') {
      const err: any = new Error('El turno no se puede cancelar en su estado actual');
      err.statusCode = 400;
      throw err;
    }

    const isOwner = appointment.customer_id === user.userId;
    if (isOwner && user.role !== 'ADMIN' && user.role !== 'RECEPTIONIST') {
      // Cliente: solo puede cancelar con mas de 24 hs de anticipacion (R-019)
      if (!isCancellable(appointment.starts_at)) {
        const err: any = new Error('No se puede cancelar con menos de 24 hs de anticipacion; gestione con el establecimiento');
        err.statusCode = 400;
        throw err;
      }
    }

    const updated = await appointmentRepository.update(id, { status: 'CANCELLED' });
    if (!updated) {
      const err: any = new Error('Turno no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }

  async getAvailability(params: {
    serviceId: string;
    date: Date; // fecha local (America/Argentina/Buenos_Aires)
    mechanicId?: string | null;
    bayId?: string | null;
  }): Promise<{ startsAt: Date; endsAt: Date }[]> {
    const service = await serviceRepository.findById(params.serviceId);
    if (!service || !service.active) {
      const err: any = new Error('Servicio no disponible');
      err.statusCode = 404;
      throw err;
    }

    const dayOfWeek = params.date.getDay(); // 0=domingo ... 6=sabado
    const hours = await workshopHoursRepository.findByDay(dayOfWeek);
    if (!hours || !hours.active) {
      return [];
    }

    const [openH, openM] = hours.open_time.split(':').map(Number);
    const [closeH, closeM] = hours.close_time.split(':').map(Number);

    const startDay = new Date(params.date);
    startDay.setHours(openH, openM, 0, 0);
    const endDay = new Date(params.date);
    endDay.setHours(closeH, closeM, 0, 0);

    const now = clock.now();

    // Turnos activos que solapan ese dia para el mecanico y/o el box
    const existing = await appointmentRepository.findConflicts(
      {
        mechanicId: params.mechanicId ?? null,
        bayId: params.bayId ?? null,
        startsAt: startDay,
        endsAt: endDay,
      },
      appointmentRepository.db
    );

    const slots: { startsAt: Date; endsAt: Date }[] = [];
    let cursor = new Date(startDay);
    while (cursor < endDay) {
      const slotEnd = addMinutes(cursor, service.duration_min);
      if (slotEnd > endDay) break;
      // No ofrecer slots pasados respecto al reloj controlado
      if (cursor <= now) {
        cursor = addMinutes(cursor, SLOT_STEP_MIN);
        continue;
      }
      const overlaps = existing.some(
        (a) => cursor < a.ends_at && slotEnd > a.starts_at
      );
      if (!overlaps) {
        slots.push({ startsAt: new Date(cursor), endsAt: new Date(slotEnd) });
      }
      cursor = addMinutes(cursor, SLOT_STEP_MIN);
    }
    return slots;
  }
}

export const appointmentService = new AppointmentService();

