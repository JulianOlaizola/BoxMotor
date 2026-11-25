import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { WorkshopBay } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class BayRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<WorkshopBay | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM workshop_bays WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as WorkshopBay;
  }

  async findByName(name: string, db?: PoolLike): Promise<WorkshopBay | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM workshop_bays WHERE name = $1 LIMIT 1',
      [name]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as WorkshopBay;
  }

  async create(data: { name: string; characteristics?: string | null; active?: boolean }, db?: PoolLike): Promise<WorkshopBay> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO workshop_bays (name, characteristics, active)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.characteristics ?? null, data.active ?? true]
    );
    return camelizeRows(rows)[0] as unknown as WorkshopBay;
  }

  async update(id: string, data: Partial<{
    name: string; characteristics: string | null; active: boolean;
  }>, db?: PoolLike): Promise<WorkshopBay | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = { name: 'name', characteristics: 'characteristics', active: 'active' };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE workshop_bays SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as WorkshopBay;
  }

  /**
   * Bloquea la fila del box (FOR UPDATE) dentro de una transaccion
   * para serializar asignaciones y evitar solapamientos (R-014, R-017).
   */
  async lock(id: string, db: PoolLike): Promise<WorkshopBay | null> {
    const { rows } = await db.query('SELECT * FROM workshop_bays WHERE id = $1 FOR UPDATE', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as WorkshopBay;
  }

  async list(filter?: { active?: boolean }, db?: PoolLike): Promise<WorkshopBay[]> {
    const database = db ?? this.db;
    let sql = 'SELECT * FROM workshop_bays';
    const params: unknown[] = [];
    if (filter?.active !== undefined) {
      sql += ` WHERE active = $${params.length + 1}`;
      params.push(filter.active);
    }
    sql += ' ORDER BY name';
    const { rows } = await database.query(sql, params);
    return camelizeRows(rows) as unknown as WorkshopBay[];
  }
}

export const bayRepository = new BayRepository();


