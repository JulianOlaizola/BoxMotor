import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { Customer } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class CustomerRepository extends BaseRepository {
  async findById(id: string, db?: PoolLike): Promise<Customer | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM customers WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Customer;
  }

  async findByUserId(userId: string, db?: PoolLike): Promise<Customer | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM customers WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Customer;
  }

  async create(data: { userId: string; phone?: string | null; address?: string | null }, db?: PoolLike): Promise<Customer> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO customers (user_id, phone, address)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.userId, data.phone ?? null, data.address ?? null]
    );
    return camelizeRows(rows)[0] as unknown as Customer;
  }

  async update(id: string, data: { phone?: string | null; address?: string | null }, db?: PoolLike): Promise<Customer | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `UPDATE customers SET phone = COALESCE($2, phone), address = COALESCE($3, address)
       WHERE id = $1 RETURNING *`,
      [id, data.phone ?? null, data.address ?? null]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as Customer;
  }

  async list(db?: PoolLike): Promise<Customer[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM customers ORDER BY created_at DESC');
    return camelizeRows(rows) as unknown as Customer[];
  }
}

export const customerRepository = new CustomerRepository();


