import { Pool } from 'pg';

/**
 * Pool de conexiones a PostgreSQL (producciÃ³n).
 * Las pruebas inyectan un PoolLike en memoria que expone la misma interfaz
 * de `query` (sin servidor Postgres disponible en el entorno de pruebas).
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type PoolLike = {
  query: (
    text: string,
    params?: unknown[]
  ) => Promise<{ rows: unknown[]; rowCount: number }>;
  connect: () => Promise<{
    query: (
      text: string,
      params?: unknown[]
    ) => Promise<{ rows: unknown[]; rowCount: number }>;
    release: () => void;
  }>;
};

