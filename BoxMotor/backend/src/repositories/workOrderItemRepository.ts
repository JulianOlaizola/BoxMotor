import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { WorkOrderItem } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class WorkOrderItemRepository extends BaseRepository {
  async create(data: {
    workOrderId: string;
    partId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }, db?: PoolLike): Promise<WorkOrderItem> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO work_order_items (work_order_id, part_id, quantity, unit_price, subtotal)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.workOrderId, data.partId, data.quantity, data.unitPrice, data.subtotal]
    );
    return camelizeRows(rows)[0] as unknown as WorkOrderItem;
  }

  async listByWorkOrder(workOrderId: string, db?: PoolLike): Promise<WorkOrderItem[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM work_order_items WHERE work_order_id = $1 ORDER BY created_at ASC',
      [workOrderId]
    );
    return camelizeRows(rows) as unknown as WorkOrderItem[];
  }
}

export const workOrderItemRepository = new WorkOrderItemRepository();


