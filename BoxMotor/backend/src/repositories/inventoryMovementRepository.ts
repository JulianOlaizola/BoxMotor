import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { InventoryMovement } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class InventoryMovementRepository extends BaseRepository {
  async create(data: {
    partId: string;
    type: InventoryMovement['type'];
    quantity: number;
    referenceType?: string | null;
    referenceId?: string | null;
    userId?: string | null;
  }, db?: PoolLike): Promise<InventoryMovement> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO inventory_movements (part_id, type, quantity, reference_type, reference_id, user_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.partId, data.type, data.quantity, data.referenceType ?? null,
       data.referenceId ?? null, data.userId ?? null]
    );
    return camelizeRows(rows)[0] as unknown as InventoryMovement;
  }

  async listByPart(partId: string, db?: PoolLike): Promise<InventoryMovement[]> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM inventory_movements WHERE part_id = $1 ORDER BY created_at DESC',
      [partId]
    );
    return camelizeRows(rows) as unknown as InventoryMovement[];
  }

  async list(db?: PoolLike): Promise<InventoryMovement[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM inventory_movements ORDER BY created_at DESC');
    return camelizeRows(rows) as unknown as InventoryMovement[];
  }
}

export const inventoryMovementRepository = new InventoryMovementRepository();


