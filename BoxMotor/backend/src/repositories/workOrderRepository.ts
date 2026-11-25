import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { WorkOrder } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class WorkOrderRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<WorkOrder | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM work_orders WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as WorkOrder;
  }

  async create(data: {
    customerId: string; vehicleId: string; appointmentId?: string | null;
    mechanicId?: string | null; bayId?: string | null;
    mileageIn: number; status?: WorkOrder['status'];
    problem: string; observations?: string | null;
  }, db?: PoolLike): Promise<WorkOrder> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO work_orders (customer_id, vehicle_id, appointment_id, mechanic_id, bay_id,
       mileage_in, status, problem, observations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.customerId, data.vehicleId, data.appointmentId ?? null,
        data.mechanicId ?? null, data.bayId ?? null, data.mileageIn,
        data.status ?? 'RECEIVED', data.problem, data.observations ?? null
      ]
    );
    return camelizeRows(rows)[0] as unknown as WorkOrder;
  }

  async update(id: string, data: Partial<{
    mechanicId: string | null; bayId: string | null;
    mileageIn: number; mileageOut: number | null;
    status: WorkOrder['status']; problem: string;
    observations: string | null; deliveredAt: Date | null;
  }>, db?: PoolLike): Promise<WorkOrder | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = {
      mechanicId: 'mechanic_id', bayId: 'bay_id', mileageIn: 'mileage_in',
      mileageOut: 'mileage_out', status: 'status', problem: 'problem',
      observations: 'observations', deliveredAt: 'delivered_at', updated_at: 'updated_at = NOW()'
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (key === 'updated_at') { fields.push(map[key]); continue; }
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE work_orders SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as WorkOrder;
  }

  async list(filter?: {
    customerId?: string; mechanicId?: string; status?: WorkOrder['status'];
  }, db?: PoolLike): Promise<WorkOrder[]> {
    const database = db ?? this.db;
    let sql = 'SELECT * FROM work_orders WHERE 1=1';
    const params: unknown[] = [];
    if (filter?.customerId) { sql += ` AND customer_id = $${params.length + 1}`; params.push(filter.customerId); }
    if (filter?.mechanicId) { sql += ` AND mechanic_id = $${params.length + 1}`; params.push(filter.mechanicId); }
    if (filter?.status) { sql += ` AND status = $${params.length + 1}`; params.push(filter.status); }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await database.query(sql, params);
    return camelizeRows(rows) as unknown as WorkOrder[];
  }
}

export const workOrderRepository = new WorkOrderRepository();


