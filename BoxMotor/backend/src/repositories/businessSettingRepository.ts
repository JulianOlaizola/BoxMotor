import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { BusinessSetting } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class BusinessSettingRepository extends BaseRepository {
  async get(key: string, db?: PoolLike): Promise<BusinessSetting | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM business_settings WHERE key = $1 LIMIT 1',
      [key]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as BusinessSetting;
  }

  async getValue(key: string, db?: PoolLike): Promise<string | null> {
    const setting = await this.get(key, db);
    return setting?.value ?? null;
  }

  async list(db?: PoolLike): Promise<BusinessSetting[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM business_settings ORDER BY key');
    return camelizeRows(rows) as unknown as BusinessSetting[];
  }
}

export const businessSettingRepository = new BusinessSettingRepository();


