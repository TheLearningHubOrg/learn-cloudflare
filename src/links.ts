import { requireAdmin } from './auth';
import { errorResponse, HttpError, json, readJson } from './http';
import type { Handler } from './router';
import { parseNewLink, randomSlug } from './validation';

export interface LinkRow {
  slug: string;
  url: string;
  clicks: number;
  created_at: number;
  expires_at: number | null;
}

interface CachedLink {
  url: string;
  expiresAt: number | null;
}

const cacheKey = (slug: string) => `link:${slug}`;
const nowSeconds = () => Math.floor(Date.now() / 1000);

/** D1 is the source of truth. KV is a read-through cache in front of it. */
export async function findLink(env: Env, slug: string): Promise<CachedLink | null> {
  const cached = await env.LINKS_CACHE.get<CachedLink>(cacheKey(slug), 'json');
  if (cached) return isExpired(cached.expiresAt) ? null : cached;

  const row = await env.DB.prepare('SELECT url, expires_at FROM links WHERE slug = ?1')
    .bind(slug)
    .first<Pick<LinkRow, 'url' | 'expires_at'>>();
  if (!row || isExpired(row.expires_at)) return null;

  const value: CachedLink = { url: row.url, expiresAt: row.expires_at };
  // KV requires expirationTtl >= 60 seconds.
  const ttl = Math.max(60, Number(env.CACHE_TTL_SECONDS) || 3600);
  await env.LINKS_CACHE.put(cacheKey(slug), JSON.stringify(value), { expirationTtl: ttl });
  return value;
}

function isExpired(expiresAt: number | null): boolean {
  return expiresAt !== null && expiresAt <= nowSeconds();
}

/** GET /:slug - the hot path. One KV read on a cache hit, no D1 query. */
export const redirect: Handler = async (_request, env, ctx, params) => {
  const slug = params.slug ?? '';
  const link = await findLink(env, slug);
  if (!link) return errorResponse(404, `No link named "${slug}"`);

  // Count the click after the response is sent. The redirect does not wait for D1.
  ctx.waitUntil(
    env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE slug = ?1').bind(slug).run(),
  );
  return Response.redirect(link.url, 302);
};

/** POST /api/links - create a short link. */
export const createLink: Handler = async (request, env) => {
  await requireAdmin(request, env);
  const input = parseNewLink(await readJson(request));
  const slug = input.slug ?? randomSlug();
  const expiresAt = input.ttlSeconds ? nowSeconds() + input.ttlSeconds : null;

  // INSERT ... ON CONFLICT DO NOTHING plus RETURNING tells us in one round trip
  // whether the slug was free, without a racy SELECT-then-INSERT.
  const created = await env.DB.prepare(
    `INSERT INTO links (slug, url, expires_at) VALUES (?1, ?2, ?3)
     ON CONFLICT (slug) DO NOTHING
     RETURNING slug, url, clicks, created_at, expires_at`,
  )
    .bind(slug, input.url, expiresAt)
    .first<LinkRow>();
  if (!created) throw new HttpError(409, `Slug "${slug}" is already taken`);

  const shortUrl = new URL(`/${slug}`, request.url).toString();
  return json({ ...toApi(created), shortUrl }, { status: 201, headers: { location: shortUrl } });
};

/** GET /api/links/:slug - stats, always from D1 so clicks are current. */
export const getLink: Handler = async (request, env, _ctx, params) => {
  await requireAdmin(request, env);
  const row = await env.DB.prepare('SELECT * FROM links WHERE slug = ?1')
    .bind(params.slug ?? '')
    .first<LinkRow>();
  if (!row) throw new HttpError(404, `No link named "${params.slug}"`);
  return json(toApi(row));
};

/** DELETE /api/links/:slug - remove from D1, then evict from KV. */
export const deleteLink: Handler = async (request, env, _ctx, params) => {
  await requireAdmin(request, env);
  const slug = params.slug ?? '';
  const result = await env.DB.prepare('DELETE FROM links WHERE slug = ?1').bind(slug).run();
  if (result.meta.changes === 0) throw new HttpError(404, `No link named "${slug}"`);
  await env.LINKS_CACHE.delete(cacheKey(slug));
  return new Response(null, { status: 204 });
};

/** Cron trigger: delete expired rows. Returns how many were removed. */
export async function purgeExpired(env: Env): Promise<number> {
  const result = await env.DB.prepare(
    'DELETE FROM links WHERE expires_at IS NOT NULL AND expires_at <= ?1',
  )
    .bind(nowSeconds())
    .run();
  return result.meta.changes;
}

function toApi(row: LinkRow) {
  return {
    slug: row.slug,
    url: row.url,
    clicks: row.clicks,
    createdAt: new Date(row.created_at * 1000).toISOString(),
    expiresAt: row.expires_at === null ? null : new Date(row.expires_at * 1000).toISOString(),
  };
}
