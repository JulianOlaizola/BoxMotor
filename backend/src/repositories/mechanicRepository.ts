import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Mechanic } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class MechanicRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Mechanic | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM mechanics WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Mechanic;
  }

  async findByUserId(userId: string, db?: PoolLike): Promise<Mechanic | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM mechanics WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Mechanic;
  }

  async create(data: { userId?: string | null; specialties?: string[]; active?: boolean }, db?: PoolLike): Promise<Mechanic> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO mechanics (user_id, specialties, active)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.userId ?? null, data.specialties ?? [], data.active ?? true]
    );
    return camelizeRows(rows)[0] as unknown as Mechanic;
  }

  async update(id: string, data: Partial<{
    specialties: string[]; active: boolean;
  }>, db?: PoolLike): Promise<Mechanic | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = { specialties: 'specialties', active: 'active' };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE mechanics SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Mechanic;
  }

  async list(filter?: { active?: boolean }, db?: PoolLike): Promise<Mechanic[]> {
    const database = db ?? this.db;
    let sql = 'SELECT * FROM mechanics';
    const params: unknown[] = [];
    if (filter?.active !== undefined) {
      sql += ` WHERE active = $${params.length + 1}`;
      params.push(filter.active);
    }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await database.query(sql, params);
    return camelizeRows(rows) as unknown as Mechanic[];
  }

  async setSpecialties(mechanicId: string, specialties: string[], db?: PoolLike): Promise<void> {
    const database = db ?? this.db;
    await database.query('BEGIN');
    try {
      await database.query('DELETE FROM mechanic_services WHERE mechanic_id = $1', [mechanicId]);
      for (const serviceId of specialties) {
        await database.query(
          'INSERT INTO mechanic_services (mechanic_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [mechanicId, serviceId]
        );
      }
      await database.query('COMMIT');
    } catch (_err) {
      await database.query('ROLLBACK').catch(() => {});
      throw _err;
    }
  }

  async findServiceIds(mechanicId: string, db?: PoolLike): Promise<string[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT service_id FROM mechanic_services WHERE mechanic_id = $1',
      [mechanicId]
    );
    return rows.map((r: any) => r.service_id);
  }

  /**
   * Bloquea la fila del mecanico (FOR UPDATE) dentro de una transaccion
   * para serializar asignaciones y evitar solapamientos (R-014, R-017).
   */
  async lock(id: string, db: PoolLike): Promise<Mechanic | null> {
    const { rows } = await db.query('SELECT * FROM mechanics WHERE id = $1 FOR UPDATE', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Mechanic;
  }

  async findByService(serviceId: string, db?: PoolLike): Promise<Mechanic[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `SELECT m.* FROM mechanics m
       JOIN mechanic_services ms ON ms.mechanic_id = m.id
       WHERE ms.service_id = $1 AND m.active = TRUE
       ORDER BY m.created_at DESC`,
      [serviceId]
    );
    return camelizeRows(rows) as unknown as Mechanic[];
  }
}

export const mechanicRepository = new MechanicRepository();


