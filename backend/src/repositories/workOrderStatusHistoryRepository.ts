import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { WorkOrderStatusHistory } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class WorkOrderStatusHistoryRepository extends BaseRepository {
  async create(data: {
    workOrderId: string;
    fromStatus?: string | null;
    toStatus: string;
    changedBy?: string | null;
    notes?: string | null;
  }, db?: PoolLike): Promise<WorkOrderStatusHistory> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.workOrderId, data.fromStatus ?? null, data.toStatus, data.changedBy ?? null, data.notes ?? null]
    );
    return camelizeRows(rows)[0] as unknown as WorkOrderStatusHistory;
  }

  async listByWorkOrder(workOrderId: string, db?: PoolLike): Promise<WorkOrderStatusHistory[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM work_order_status_history WHERE work_order_id = $1 ORDER BY changed_at ASC',
      [workOrderId]
    );
    return camelizeRows(rows) as unknown as WorkOrderStatusHistory[];
  }
}

export const workOrderStatusHistoryRepository = new WorkOrderStatusHistoryRepository();


