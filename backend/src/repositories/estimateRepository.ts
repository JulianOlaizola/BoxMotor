import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Estimate } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class EstimateRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Estimate | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM estimates WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Estimate;
  }

  async findByWorkOrder(workOrderId: string, db?: PoolLike): Promise<Estimate | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM estimates WHERE work_order_id = $1 ORDER BY version DESC LIMIT 1',
      [workOrderId]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Estimate;
  }

  async create(data: {
    workOrderId: string;
    version: number;
    laborTotal: number;
    partsTotal: number;
    total: number;
    status: Estimate['status'];
    issuedAt: Date;
    expiresAt: Date;
    notes?: string | null;
    customerId: string;
  }, db?: PoolLike): Promise<Estimate> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO estimates (work_order_id, version, labor_total, parts_total, total,
       status, issued_at, expires_at, notes, customer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        data.workOrderId, data.version, data.laborTotal, data.partsTotal,
        data.total, data.status, data.issuedAt, data.expiresAt,
        data.notes ?? null, data.customerId
      ]
    );
    return camelizeRows(rows)[0] as unknown as Estimate;
  }

  async update(id: string, data: Partial<{
    status: Estimate['status']; total: number; notes: string | null;
    version: number; laborTotal: number; partsTotal: number;
    issuedAt: Date; expiresAt: Date;
  }>, db?: PoolLike): Promise<Estimate | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = {
      status: 'status', total: 'total', notes: 'notes',
      version: 'version', laborTotal: 'labor_total', partsTotal: 'parts_total',
      issuedAt: 'issued_at', expiresAt: 'expires_at',
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE estimates SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Estimate;
  }

  async list(filter?: { workOrderId?: string; customerId?: string; status?: Estimate['status'] }, db?: PoolLike): Promise<Estimate[]> {
    const database = db ?? this.db;
    let sql = 'SELECT * FROM estimates WHERE 1=1';
    const params: unknown[] = [];
    if (filter?.workOrderId) { sql += ` AND work_order_id = $${params.length + 1}`; params.push(filter.workOrderId); }
    if (filter?.customerId) { sql += ` AND customer_id = $${params.length + 1}`; params.push(filter.customerId); }
    if (filter?.status) { sql += ` AND status = $${params.length + 1}`; params.push(filter.status); }
    sql += ' ORDER BY issued_at DESC';
    const { rows } = await database.query(sql, params);
    return camelizeRows(rows) as unknown as Estimate[];
  }
}

export const estimateRepository = new EstimateRepository();


