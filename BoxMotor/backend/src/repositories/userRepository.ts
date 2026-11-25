import { BaseRepository } from './base.js';
import type { PoolLike } from '../db/pool.js';
import type { User, Role } from '../models/index.js';
import { camelizeRows } from '../models/index.js';

export class UserRepository extends BaseRepository {
  async findByEmail(email: string, db?: PoolLike): Promise<User | null> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as User;
  }

  async findById(id: string, db?: PoolLike): Promise<User | null> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as User;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    role: Role;
    firstName: string;
    lastName: string;
  }, db?: PoolLike): Promise<User> {
    const database = db ?? this.db;
    const { rows } = await database.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [data.email, data.passwordHash, data.role, data.firstName, data.lastName]
    );
    return camelizeRows(rows)[0] as unknown as User;
  }

  async update(id: string, data: Partial<{
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    active: boolean;
  }>, db?: PoolLike): Promise<User | null> {
    const database = db ?? this.db;
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    const map: Record<string, string> = {
      email: 'email', role: 'role', firstName: 'first_name',
      lastName: 'last_name', active: 'active'
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      fields.push(`${map[key]} = $${i++}`);
      params.push(value);
    }
    if (!fields.length) return this.findById(id, database);
    params.push(id);
    const { rows } = await database.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (!rows.length) return null;
    return camelizeRows(rows)[0] as unknown as User;
  }

  async list(db?: PoolLike): Promise<User[]> {
    const database = db ?? this.db;
    const { rows } = await database.query('SELECT * FROM users ORDER BY created_at DESC');
    return camelizeRows(rows) as unknown as User[];
  }
}

export const userRepository = new UserRepository();


