import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { EstimateItem } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class EstimateItemRepository extends BaseRepository {
  async create(data: {
    estimateId: string;
    version: number;
    partId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }, db?: PoolLike): Promise<EstimateItem> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO estimate_items (estimate_id, version, part_id, quantity, unit_price, subtotal)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.estimateId, data.version, data.partId, data.quantity, data.unitPrice, data.subtotal]
    );
    return camelizeRows(rows)[0] as unknown as EstimateItem;
  }

  async listByEstimate(estimateId: string, version: number, db?: PoolLike): Promise<EstimateItem[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM estimate_items WHERE estimate_id = $1 AND version = $2 ORDER BY id ASC',
      [estimateId, version]
    );
    return camelizeRows(rows) as unknown as EstimateItem[];
  }

  async listByEstimateAllVersions(estimateId: string, db?: PoolLike): Promise<EstimateItem[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM estimate_items WHERE estimate_id = $1 ORDER BY version ASC, id ASC',
      [estimateId]
    );
    return camelizeRows(rows) as unknown as EstimateItem[];
  }
}

export const estimateItemRepository = new EstimateItemRepository();


