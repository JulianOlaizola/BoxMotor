import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { WorkshopHour } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class WorkshopHoursRepository extends BaseRepository {
  async findByDay(dayOfWeek: number, db?: PoolLike): Promise<WorkshopHour | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM workshop_hours WHERE day_of_week = $1 LIMIT 1',
      [dayOfWeek]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as WorkshopHour;
  }

  async list(filter?: { active?: boolean }, db?: PoolLike): Promise<WorkshopHour[]> {
    const database = db ?? this.db;
    let sql = 'SELECT * FROM workshop_hours';
    const params: unknown[] = [];
    if (filter?.active !== undefined) {
      sql += ` WHERE active = $${params.length + 1}`;
      params.push(filter.active);
    }
    sql += ' ORDER BY day_of_week';
    const { rows } = await database.query(sql, params);
    return camelizeRows(rows) as unknown as WorkshopHour[];
  }

  async upsert(data: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    active?: boolean;
  }, db?: PoolLike): Promise<WorkshopHour> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO workshop_hours (day_of_week, open_time, close_time, active)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week) DO UPDATE
       SET open_time = EXCLUDED.open_time,
           close_time = EXCLUDED.close_time,
           active = EXCLUDED.active
       RETURNING *`,
      [data.dayOfWeek, data.openTime, data.closeTime, data.active ?? true]
    );
    return camelizeRows(rows)[0] as unknown as WorkshopHour;
  }
}

export const workshopHoursRepository = new WorkshopHoursRepository();


