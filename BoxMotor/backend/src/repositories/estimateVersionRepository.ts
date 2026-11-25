import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { EstimateVersion } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class EstimateVersionRepository extends BaseRepository {
  async createEstimateVersion(data: {
    estimateId: string;
    version: number;
    total: number;
    status: string;
    issuedAt: Date;
  }, db?: PoolLike): Promise<EstimateVersion> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO estimate_versions (estimate_id, version, total, status, issued_at)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.estimateId, data.version, data.total, data.status, data.issuedAt]
    );
    return camelizeRows(rows)[0] as unknown as EstimateVersion;
  }

  async listByEstimate(estimateId: string, db?: PoolLike): Promise<EstimateVersion[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM estimate_versions WHERE estimate_id = $1 ORDER BY version DESC',
      [estimateId]
    );
    return camelizeRows(rows) as unknown as EstimateVersion[];
  }
}

export const estimateVersionRepository = new EstimateVersionRepository();


