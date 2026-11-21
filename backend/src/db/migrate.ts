import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

async function ensureMigrationsTable(client: typeof pool) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getApplied(client: typeof pool): Promise<string[]> {
  const { rows } = await client.query('SELECT filename FROM schema_migrations ORDER BY filename');
  return rows.map((r: { filename: string }) => r.filename);
}

export async function migrate(client: typeof pool = pool): Promise<void> {
  await ensureMigrationsTable(client);
  const applied = new Set(await getApplied(client));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[migrate] aplicado: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
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

