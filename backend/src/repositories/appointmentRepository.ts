import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Appointment } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

const ACTIVE_STATUSES = ["'PENDING'", "'CONFIRMED'"];

export class AppointmentRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Appointment | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM appointments WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Appointment;
  }

  async create(data: {
    customerId: string; vehicleId: string; serviceId: string;
    mechanicId?: string | null; bayId?: string | null;
    startsAt: Date; endsAt: Date; status?: Appointment['status'];
    reason?: string | null; problemDescription?: string | null;
  }, db?: PoolLike): Promise<Appointment> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO appointments (customer_id, vehicle_id, service_id, mechanic_id, bay_id,
       starts_at, ends_at, status, reason, problem_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        data.customerId, data.vehicleId, data.serviceId,
        data.mechanicId ?? null, data.bayId ?? null,
        data.startsAt, data.endsAt, data.status ?? 'PENDING',
        data.reason ?? null, data.problemDescription ?? null
      ]
    );
    return camelizeRows(rows)[0] as unknown as Appointment;
  }

  async update(id: string, data: Partial<{
    mechanicId: string | null; bayId: string | null;
    startsAt: Date; endsAt: Date; status: Appointment['status'];
    reason: string | null; problemDescription: string | null;
  }>, db?: PoolLike): Promise<Appointment | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = {
      mechanicId: 'mechanic_id', bayId: 'bay_id', startsAt: 'starts_at',
      endsAt: 'ends_at', status: 'status', reason: 'reason',
      problemDescription: 'problem_description'
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Appointment;
  }

  /**
   * Busca turnos activos (PENDING/CONFIRMED) que se solapan con un intervalo
   * dado para un mecanico o un box. Se usa dentro de una transaccion con
   * bloqueo de filas (FOR UPDATE) para prevenir solapamientos (R-014, R-017).
   */
  async findConflicts(params: {
    mechanicId?: string | null;
    bayId?: string | null;
    startsAt: Date;
    endsAt: Date;
    excludeId?: string | null;
  }, db: PoolLike): Promise<Appointment[]> {
    const conditions: string[] = [
      'status IN (' + ACTIVE_STATUSES.join(',') + ')',
      'starts_at < $' + (paramsAsNum(1, [params.startsAt, params.endsAt]).length + 2),
      'ends_at > $' + (paramsAsNum(1, [params.startsAt, params.endsAt]).length + 3)
    ];
    const values: unknown[] = [params.startsAt, params.endsAt];
    let paramIdx = 3;
    if (params.mechanicId) {
      conditions.push(`mechanic_id = $${paramIdx++}`);
      values.push(params.mechanicId);
    }
    if (params.bayId) {
      conditions.push(`bay_id = $${paramIdx++}`);
      values.push(params.bayId);
    }
    if (params.excludeId) {
      conditions.push(`id <> $${paramIdx++}`);
      values.push(params.excludeId);
    }
    const sql = `SELECT * FROM appointments WHERE ${conditions.join(' AND ')}`;
    const { rows } = await db.query(sql, values);
    return camelizeRows(rows) as unknown as Appointment[];
  }

  async listByCustomer(customerId: string, db?: PoolLike): Promise<Appointment[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM appointments WHERE customer_id = $1 ORDER BY starts_at DESC',
      [customerId]
    );
    return camelizeRows(rows) as unknown as Appointment[];
  }

  async list(db?: PoolLike): Promise<Appointment[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM appointments ORDER BY starts_at DESC');
    return camelizeRows(rows) as unknown as Appointment[];
  }
}

function paramsAsNum(_start: number, vals: unknown[]): number[] {
  return vals.map((_, i) => i + 1);
}

export const appointmentRepository = new AppointmentRepository();


