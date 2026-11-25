import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { PoolLike } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Carga variables de entorno desde backend/.env (ignorado por Git).
 * Se ejecuta ANTES de importar el pool para que DATABASE_URL esté disponible
 * cuando pool.js cree el Pool de PostgreSQL.
 */
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

/**
 * Detecta si este módulo se está ejecutando directamente (npm run migrate),
 * compatible con ES Modules y con separadores de ruta de Windows/Linux.
 */
function isMainModule(): boolean {
  const mainArgv = process.argv[1];
  if (!mainArgv) return false;
  const mainResolved = path.resolve(mainArgv);
  const thisResolved = path.resolve(fileURLToPath(import.meta.url));
  return mainResolved === thisResolved;
}

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

/**
 * Ejecuta las migraciones pendientes dentro de transacciones atómicas.
 * Cada migración usa un cliente dedicado obtenido de pool.connect() para
 * garantizar que BEGIN, SQL, INSERT y COMMIT usen la misma conexión.
 * client es opcional para permitir pruebas con clientes simulados.
 */
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

    // Obtener cliente dedicado para la transacción de esta migración
    const pgClient = await db.connect();
    try {
      await pgClient.query('BEGIN');
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await pgClient.query(sql);
      await pgClient.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await pgClient.query('COMMIT');
      console.log(`[migrate] aplicado: ${file}`);
    } catch (err) {
      await pgClient.query('ROLLBACK').catch(() => {
        // Ignorar errores de rollback; el error original es lo relevante
      });
      console.error(`[migrate] error aplicando ${file}:`, err);
      throw err;
    } finally {
      pgClient.release();
    }
  }
}

// Ejecución directa solo cuando se invoca como script principal
if (isMainModule()) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
