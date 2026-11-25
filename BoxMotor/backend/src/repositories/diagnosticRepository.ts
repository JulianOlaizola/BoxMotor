import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Diagnostic } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class DiagnosticRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Diagnostic | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM diagnostics WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Diagnostic;
  }

  async findByWorkOrder(workOrderId: string, db?: PoolLike): Promise<Diagnostic | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM diagnostics WHERE work_order_id = $1 ORDER BY created_at DESC LIMIT 1',
      [workOrderId]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Diagnostic;
  }

  async create(data: {
    workOrderId: string;
    mechanicId: string;
    identifiedProblem: string;
    observations?: string | null;
    possibleCauses?: string | null;
    recommendedRepairs?: string | null;
    priority?: string;
  }, db?: PoolLike): Promise<Diagnostic> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO diagnostics (work_order_id, mechanic_id, identified_problem, observations,
       possible_causes, recommended_repairs, priority)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        data.workOrderId, data.mechanicId, data.identifiedProblem,
        data.observations ?? null, data.possibleCauses ?? null,
        data.recommendedRepairs ?? null, data.priority ?? 'MEDIA'
      ]
    );
    return camelizeRows(rows)[0] as unknown as Diagnostic;
  }

  async list(db?: PoolLike): Promise<Diagnostic[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM diagnostics ORDER BY created_at DESC');
    return camelizeRows(rows) as unknown as Diagnostic[];
  }
}

export const diagnosticRepository = new DiagnosticRepository();


