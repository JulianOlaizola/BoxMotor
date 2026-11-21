import { Pool } from 'pg';
import type { PoolLike } from './pool.js';

export type QueryRunner = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;
  release?: () => void;
};

/**
 * Ejecuta fn dentro de una transaccion.
 * - Pool real de pg: usa un solo cliente (connect/BEGIN/COMMIT/ROLLBACK/release) para
 *   conservar bloqueos FOR UPDATE entre consultas (concurrency-safe).
 * - PoolLike (pruebas en memoria): BEGIN/COMMIT/ROLLBACK son no-ops y todas las consultas
 *   comparten el mismo estado en memoria.
 */
export async function withTransaction(
  db: PoolLike | Pool,
  fn: (tx: QueryRunner) => Promise<void>
): Promise<void> {
  if ('connect' in db && typeof (db as Pool).connect === 'function') {
    const client = await (db as Pool).connect();
    try {
      await client.query('BEGIN');
      await fn(client as unknown as QueryRunner);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
    return;
  }

  await (db as PoolLike).query('BEGIN').catch(() => {});
  try {
    await fn(db as unknown as QueryRunner);
    await (db as PoolLike).query('COMMIT').catch(() => {});
  } catch (err) {
    await (db as PoolLike).query('ROLLBACK').catch(() => {});
    throw err;
  }
}

