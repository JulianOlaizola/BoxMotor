import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Part } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class PartRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Part | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM parts WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Part;
  }

  async findByCode(code: string, db?: PoolLike): Promise<Part | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM parts WHERE code = $1 LIMIT 1', [code]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Part;
  }

  async create(data: {
    code: string; name: string; description?: string | null;
    brand?: string | null; category?: string | null;
    price: number; quantityAvailable?: number; minStock?: number; active?: boolean;
  }, db?: PoolLike): Promise<Part> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO parts (code, name, description, brand, category, price,
       quantity_available, min_stock, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.code, data.name, data.description ?? null, data.brand ?? null,
        data.category ?? null, data.price, data.quantityAvailable ?? 0,
        data.minStock ?? 0, data.active ?? true
      ]
    );
    return camelizeRows(rows)[0] as unknown as Part;
  }

  async update(id: string, data: Partial<{
    code: string; name: string; description: string | null; brand: string | null;
    category: string | null; price: number; quantityAvailable: number;
    minStock: number; active: boolean;
  }>, db?: PoolLike): Promise<Part | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = {
      code: 'code', name: 'name', description: 'description', brand: 'brand',
      category: 'category', price: 'price', quantityAvailable: 'quantity_available',
      minStock: 'min_stock', active: 'active'
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE parts SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Part;
  }

  /**
   * Bloquea la fila del repuesto (FOR UPDATE) dentro de una transaccion
   * para operaciones de stock concurrency-safe (R-032, R-033).
   */
  async lock(id: string, db: PoolLike): Promise<Part | null> {
    const { rows } = await db.query('SELECT * FROM parts WHERE id = $1 FOR UPDATE', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Part;
  }

  async list(filter?: { active?: boolean }, db?: PoolLike): Promise<Part[]> {
    const database = db ?? this.db;
    let sql = 'SELECT * FROM parts';
    const params: unknown[] = [];
    if (filter?.active !== undefined) {
      sql += ` WHERE active = $${params.length + 1}`;
      params.push(filter.active);
    }
    sql += ' ORDER BY code';
    const { rows } = await database.query(sql, params);
    return camelizeRows(rows) as unknown as Part[];
  }
}

export const partRepository = new PartRepository();


