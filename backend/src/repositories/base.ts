import { pool } from '../db/pool.js';
import type { PoolLike } from '../db/pool.js';

/**
 * Repositorio base. Toda consulta es parametrizada (pg) para evitar inyeccion SQL.
 * Las pruebas inyectan un PoolLike en memoria mediante el constructor.
 */
export abstract class BaseRepository {
  db: PoolLike;
  constructor(db?: PoolLike) {
    this.db = db ?? pool;
  }

  /** Sustituye el pool (utilizado por las pruebas con un pool en memoria). */
  setDb(db: PoolLike): void {
    this.db = db;
  }
}



