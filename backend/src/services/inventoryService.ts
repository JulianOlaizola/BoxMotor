import { withTransaction } from '../db/transaction.js';
import {
  partRepository,
  inventoryMovementRepository,
  partReservationRepository,
} from '../repositories/index.js';

type Tx = any;

export class InventoryService {
  async ingreso(data: {
    partId: string;
    quantity: number;
    userId?: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
  }) {
    const part = await partRepository.findById(data.partId);
    if (!part) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    const updated = await partRepository.update(
      part.id,
      { quantityAvailable: part.quantity_available + data.quantity }
    );
    await inventoryMovementRepository.create({
      partId: data.partId,
      type: 'ingreso',
      quantity: data.quantity,
      referenceType: data.referenceType ?? null,
      referenceId: data.referenceId ?? null,
      userId: data.userId ?? null,
    });
    return { part: updated };
  }

  /**
   * Consumo directo (sin reserva): valida stock suficiente y descuenta (R-032).
   * No permite stock negativo.
   */
  async consumeDirect(data: {
    partId: string;
    quantity: number;
    userId?: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
  }) {
    let result: any;
    await withTransaction(partRepository.db, async (tx) => {
      const part = await partRepository.lock(data.partId, tx as Tx);
      if (!part) {
        const err: any = new Error('Repuesto no encontrado');
        err.statusCode = 404;
        throw err;
      }
      if (part.quantity_available < data.quantity) {
        const err: any = new Error('Stock insuficiente');
        err.statusCode = 409;
        throw err;
      }
      await partRepository.update(
        part.id,
        { quantityAvailable: part.quantity_available - data.quantity },
        tx as Tx
      );
      await inventoryMovementRepository.create(
        {
          partId: data.partId,
          type: 'consumo',
          quantity: data.quantity,
          referenceType: data.referenceType ?? null,
          referenceId: data.referenceId ?? null,
          userId: data.userId ?? null,
        },
        tx as Tx
      );
      result = { part: await partRepository.findById(data.partId, tx as Tx) };
    });
    return result;
  }

  /**
   * Consume una reserva existente: reserved -> consumed (R-034).
   * El stock ya fue descontado al reservar; aqui solo cambia el estado y se traza.
   */
  async consumeReservation(data: {
    reservationId: string;
    userId?: string | null;
  }) {
    let result: any;
    await withTransaction(partRepository.db, async (tx) => {
      const { rows } = await tx.query(
        'SELECT * FROM part_reservations WHERE id = $1 FOR UPDATE',
        [data.reservationId]
      );
      if (!rows.length) {
        const err: any = new Error('Reserva no encontrada');
        err.statusCode = 404;
        throw err;
      }
      const reservation = rows[0] as any;
      if (reservation.status !== 'reserved') {
        const err: any = new Error('La reserva ya esta consumida o liberada');
        err.statusCode = 400;
        throw err;
      }
      await tx.query(
        'UPDATE part_reservations SET status = $1 WHERE id = $2',
        ['consumed', data.reservationId]
      );
      await inventoryMovementRepository.create(
        {
          partId: reservation.part_id,
          type: 'consumo',
          quantity: reservation.quantity,
          referenceType: 'part_reservation',
          referenceId: data.reservationId,
          userId: data.userId ?? null,
        },
        tx as Tx
      );
      result = { reservationId: data.reservationId, status: 'consumed' };
    });
    return result;
  }

  /**
   * Ajuste de stock (positivo o negativo representado como ajuste).
   * Valida que no quede negativo.
   */
  async adjust(data: {
    partId: string;
    quantityAvailable: number;
    userId?: string | null;
    reason?: string | null;
  }) {
    const part = await partRepository.findById(data.partId);
    if (!part) {
      const err: any = new Error('Repuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (data.quantityAvailable < 0) {
      const err: any = new Error('El stock no puede ser negativo');
      err.statusCode = 400;
      throw err;
    }
    const delta = data.quantityAvailable - part.quantity_available;
    const updated = await partRepository.update(
      part.id,
      { quantityAvailable: data.quantityAvailable }
    );
    await inventoryMovementRepository.create({
      partId: data.partId,
      type: 'ajuste',
      quantity: Math.abs(delta),
      referenceType: 'adjustment',
      referenceId: null,
      userId: data.userId ?? null,
    });
    return { part: updated, delta };
  }

  async listMovements(partId?: string) {
    if (partId) {
      return inventoryMovementRepository.listByPart(partId);
    }
    return inventoryMovementRepository.list();
  }
}

export const inventoryService = new InventoryService();

