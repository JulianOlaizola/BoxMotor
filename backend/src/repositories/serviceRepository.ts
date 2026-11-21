import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Service } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class ServiceRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Service | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM services WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Service;
  }

  async create(data: {
    name: string;
    description?: string | null;
    durationMin: number;
    laborPrice: number;
    active?: boolean;
  }, db?: PoolLike): Promise<Service> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO services (name, description, duration_min, labor_price, active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.description ?? null, data.durationMin, data.laborPrice, data.active ?? true]
    );
    return camelizeRows(rows)[0] as unknown as Service;
  }

  async update(id: string, data: Partial<{
    name: string; description: string | null; durationMin: number;
    laborPrice: number; active: boolean;
  }>, db?: PoolLike): Promise<Service | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = {
      name: 'name', description: 'description', durationMin: 'duration_min',
      laborPrice: 'labor_price', active: 'active'
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Service;
  }

  async list(filter?: { active?: boolean }, db?: PoolLike): Promise<Service[]> {
    const database = db ?? this.db;
    let sql = 'SELECT * FROM services';
    const params: unknown[] = [];
    if (filter?.active !== undefined) {
      sql += ` WHERE active = $${params.length + 1}`;
      params.push(filter.active);
    }
    sql += ' ORDER BY name';
    const { rows } = await database.query(sql, params);
    return camelizeRows(rows) as unknown as Service[];
  }
}

export const serviceRepository = new ServiceRepository();


