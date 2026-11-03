// Self-hosted runner for the bundled Worker. It runs dist/worker/index.js in
// workerd (Cloudflare's open-source Workers runtime) through Miniflare, with
// local KV, D1 and R2 stored on disk. Production on Cloudflare uses
// `wrangler deploy` instead; this image exists for CI smoke tests and for
// running the Worker off-platform.
import { readdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Miniflare, type MiniflareOptions } from 'miniflare';

const port = Number(process.env.PORT ?? 8080);
const persistRoot = process.env.PERSIST_DIR ?? path.join(os.tmpdir(), 'learn-cloudflare-data');

// Keep in step with wrangler.jsonc. The Docker smoke test in CI catches drift.
const options: MiniflareOptions = {
  modules: true,
  scriptPath: 'dist/worker/index.js',
  compatibilityDate: '2026-07-01',
  bindings: {
    APP_NAME: 'learn-cloudflare',
    CACHE_TTL_SECONDS: '3600',
    ADMIN_TOKEN: process.env.ADMIN_TOKEN ?? '',
  },
  kvNamespaces: ['LINKS_CACHE'],
  d1Databases: ['DB'],
  r2Buckets: ['FILES'],
  defaultPersistRoot: persistRoot,
};

/** Split a migration file into statements, dropping "--" comment lines. */
function splitStatements(sql: string): string[] {
  return sql
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Apply migrations/*.sql in file-name order, each file in one batch. */
async function migrate(mf: Miniflare): Promise<void> {
  const db = await mf.getD1Database('DB');
  await db.prepare('CREATE TABLE IF NOT EXISTS d1_migrations (name TEXT PRIMARY KEY)').run();
  const files = (await readdir('migrations')).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const done = await db.prepare('SELECT 1 FROM d1_migrations WHERE name = ?1').bind(file).first();
    if (done) continue;
    const sql = await readFile(path.join('migrations', file), 'utf8');
    await db.batch([
      ...splitStatements(sql).map((s) => db.prepare(s)),
      db.prepare('INSERT INTO d1_migrations (name) VALUES (?1)').bind(file),
    ]);
    console.log(`applied migration ${file}`);
  }
}

// 1. Start on a random loopback port so no traffic arrives before the schema exists.
const mf = new Miniflare({ ...options, host: '127.0.0.1', port: 0 });
await mf.ready;
await migrate(mf);

// 2. Re-bind on the public port. Storage is on disk, so the migrated data stays.
await mf.setOptions({ ...options, host: '0.0.0.0', port });
await mf.ready;
console.log(`Worker listening on 0.0.0.0:${port} (storage in ${persistRoot})`);

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, stopping workerd`);
  await mf.dispose();
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
