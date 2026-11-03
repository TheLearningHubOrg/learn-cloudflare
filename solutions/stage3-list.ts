// Stage 3 exercise: GET /api/links?limit=20&after=<slug> with keyset pagination.
// Wire it up in src/index.ts with: .get('/api/links', listLinks)
import { requireAdmin } from '../src/auth';
import { HttpError, json } from '../src/http';
import type { LinkRow } from '../src/links';
import type { Handler } from '../src/router';

export const listLinks: Handler = async (request, env) => {
  await requireAdmin(request, env);
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get('limit') ?? 20);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, '"limit" must be between 1 and 100');
  }
  const after = params.get('after') ?? '';

  // Keyset pagination: "slug > ?1" walks the primary key index, so page 500
  // costs the same as page 1. OFFSET would scan and discard every earlier row.
  const { results } = await env.DB.prepare(
    'SELECT slug, url, clicks FROM links WHERE slug > ?1 ORDER BY slug LIMIT ?2',
  )
    .bind(after, limit + 1)
    .all<Pick<LinkRow, 'slug' | 'url' | 'clicks'>>();

  const page = results.slice(0, limit);
  const next = results.length > limit ? (page.at(-1)?.slug ?? null) : null;
  return json({ links: page, next });
};
