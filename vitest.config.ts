import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  // Read the SQL files in Node.js; the setup file applies them inside workerd.
  const migrations = await readD1Migrations('./migrations');

  return {
    plugins: [
      cloudflareTest({
        // Bindings, vars and compatibility settings come from the real config file.
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: { ADMIN_TOKEN: 'test-token', TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: {
      setupFiles: ['./test/apply-migrations.ts'],
    },
  };
});
