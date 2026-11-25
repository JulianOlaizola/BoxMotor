import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { AuditLog } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class AuditLogRepository extends BaseRepository {
  async create(data: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    oldValues?: unknown;
    newValues?: unknown;
  }, db?: PoolLike): Promise<AuditLog> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.userId ?? null, data.action, data.entity, data.entityId ?? null,
       data.oldValues ?? null, data.newValues ?? null]
    );
    return camelizeRows(rows)[0] as unknown as AuditLog;
  }

  async list(db?: PoolLike): Promise<AuditLog[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM audit_logs ORDER BY created_at DESC');
    return camelizeRows(rows) as unknown as AuditLog[];
  }
}

export const auditLogRepository = new AuditLogRepository();


