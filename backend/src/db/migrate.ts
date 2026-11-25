import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { PoolLike } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carga variables de entorno desde backend/.env (ignorado por Git).
// Se ejecuta ANTES de importar el pool para que DATABASE_URL esté disponible
// cuando pool.js lea process.env.DATABASE_URL.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

// Se importa dinámicamente DESPUÉS de dotenv.config() para que pool.js lea
// process.env.DATABASE_URL ya cargado desde backend/.env.
let _pool: PoolLike | null = null;
async function getPool(): Promise<PoolLike> {
  if (!_pool) {
    const mod = await import('./pool.js');
    _pool = mod.pool;
  }
  return _pool;
}

async function ensureMigrationsTable(client: PoolLike): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getApplied(client: PoolLike): Promise<string[]> {
  const result = await client.query(
    'SELECT filename FROM schema_migrations ORDER BY filename'
  );
  const rows = result.rows as { filename: string }[];
  return rows.map((r) => r.filename);
}

export async function migrate(client?: PoolLike): Promise<void> {
  const db = client ?? (await getPool());
  await ensureMigrationsTable(db);
  const applied = new Set(await getApplied(db));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await db.query('BEGIN');
    try {
      await db.query(sql);
      await db.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await db.query('COMMIT');
      console.log(`[migrate] aplicado: ${file}`);
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(`[migrate] error aplicando ${file}:`, err);
      throw err;
    }
  }
}

if (process.argv[1]?.endsWith('db/migrate.ts') || require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
