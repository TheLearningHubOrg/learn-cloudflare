// Secrets are not in wrangler.jsonc, so `wrangler types` cannot see them unless
// a .dev.vars file exists. Declare them here so the type is always present.
interface Env {
  ADMIN_TOKEN: string;
}

declare namespace Cloudflare {
  interface Env {
    ADMIN_TOKEN: string;
  }
}
