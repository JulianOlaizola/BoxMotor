import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { PartReservation } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class PartReservationRepository extends BaseRepository {
  async create(data: {
    estimateId?: string | null;
    workOrderId?: string | null;
    partId: string;
    quantity: number;
    status?: string;
  }, db?: PoolLike): Promise<PartReservation> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO part_reservations (estimate_id, work_order_id, part_id, quantity, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.estimateId ?? null, data.workOrderId ?? null, data.partId, data.quantity, data.status ?? 'reserved']
    );
    return camelizeRows(rows)[0] as unknown as PartReservation;
  }

  async listByWorkOrder(workOrderId: string, db?: PoolLike): Promise<PartReservation[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM part_reservations WHERE work_order_id = $1 ORDER BY created_at ASC',
      [workOrderId]
    );
    return camelizeRows(rows) as unknown as PartReservation[];
  }

  async listByEstimate(estimateId: string, db?: PoolLike): Promise<PartReservation[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM part_reservations WHERE estimate_id = $1 ORDER BY created_at ASC',
      [estimateId]
    );
    return camelizeRows(rows) as unknown as PartReservation[];
  }

  async releaseNonConsumedByWorkOrder(workOrderId: string, db?: PoolLike): Promise<void> {
    const database = db ?? this.db;
    await database.query(
      `UPDATE part_reservations SET status = 'released', released_at = NOW()
       WHERE work_order_id = $1 AND status = 'reserved'`,
      [workOrderId]
    );
  }
}

export const partReservationRepository = new PartReservationRepository();


