import { applyD1Migrations, env } from 'cloudflare:test';

// Idempotent: already-applied migrations are recorded in d1_migrations and skipped.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
