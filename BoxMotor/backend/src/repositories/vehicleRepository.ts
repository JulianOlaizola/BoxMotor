import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Vehicle } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class VehicleRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Vehicle | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM vehicles WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Vehicle;
  }

  async findByPlateNorm(plateNorm: string, db?: PoolLike): Promise<Vehicle | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM vehicles WHERE plate_norm = $1 LIMIT 1',
      [plateNorm]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Vehicle;
  }

  async create(data: {
    customerId: string;
    brand: string;
    model: string;
    version?: string | null;
    year: number;
    plateNorm: string;
    plateRaw: string;
    mileage?: number;
    fuel?: string | null;
    transmission?: string | null;
    vin?: string | null;
    observations?: string | null;
  }, db?: PoolLike): Promise<Vehicle> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO vehicles (customer_id, brand, model, version, year, plate_norm, plate_raw,
       mileage, fuel, transmission, vin, observations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        data.customerId, data.brand, data.model, data.version ?? null, data.year,
        data.plateNorm, data.plateRaw, data.mileage ?? 0,
        data.fuel ?? null, data.transmission ?? null, data.vin ?? null,
        data.observations ?? null
      ]
    );
    return camelizeRows(rows)[0] as unknown as Vehicle;
  }

  async update(id: string, data: Partial<{
    brand: string; model: string; version: string | null; year: number;
    plateRaw: string; mileage: number; fuel: string | null;
    transmission: string | null; vin: string | null; observations: string | null;
  }>, db?: PoolLike): Promise<Vehicle | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = {
      brand: 'brand', model: 'model', version: 'version', year: 'year',
      plateRaw: 'plate_raw', mileage: 'mileage', fuel: 'fuel',
      transmission: 'transmission', vin: 'vin', observations: 'observations'
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Vehicle;
  }

  async listByCustomer(customerId: string, db?: PoolLike): Promise<Vehicle[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM vehicles WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    return camelizeRows(rows) as unknown as Vehicle[];
  }

  async list(db?: PoolLike): Promise<Vehicle[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    return camelizeRows(rows) as unknown as Vehicle[];
  }
}

export const vehicleRepository = new VehicleRepository();


