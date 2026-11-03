import { createExecutionContext, createScheduledController, env, waitOnExecutionContext } from 'cloudflare:test';
import { exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import worker from '../src/index';
import { ADMIN, call, postJson } from './helpers';

describe('health', () => {
  it('answers through the real runtime entry point', async () => {
    // exports.default is the Worker as the runtime sees it, like a request from the edge.
    const response = await exports.default.fetch('https://sho.rt/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok', name: 'learn-cloudflare' });
  });

  it('returns 405 for a known path with the wrong method', async () => {
    const response = await call('/health', { method: 'POST' });
    expect(response.status).toBe(405);
  });
});

describe('links', () => {
  it('requires the admin token to create a link', async () => {
    const response = await postJson('/api/links', { url: 'https://example.com' }, {});
    expect(response.status).toBe(401);
  });

  it('creates, redirects, counts clicks and caches in KV', async () => {
    const created = await postJson('/api/links', { url: 'https://developers.cloudflare.com', slug: 'cf-docs' });
    expect(created.status).toBe(201);
    expect(created.headers.get('location')).toBe('https://sho.rt/cf-docs');

    const first = await call('/cf-docs');
    expect(first.status).toBe(302);
    expect(first.headers.get('location')).toBe('https://developers.cloudflare.com/');
    expect(await env.LINKS_CACHE.get('link:cf-docs', 'json')).toMatchObject({
      url: 'https://developers.cloudflare.com/',
    });

    await call('/cf-docs'); // served from KV this time

    const stats = await call('/api/links/cf-docs', { headers: ADMIN });
    expect(await stats.json()).toMatchObject({ slug: 'cf-docs', clicks: 2 });
  });

  it('rejects a duplicate slug with 409', async () => {
    await postJson('/api/links', { url: 'https://a.example', slug: 'taken' });
    const again = await postJson('/api/links', { url: 'https://b.example', slug: 'taken' });
    expect(again.status).toBe(409);
  });

  it('returns 400 for malformed JSON and 415 for the wrong content type', async () => {
    const bad = await call('/api/links', {
      method: 'POST',
      headers: { ...ADMIN, 'content-type': 'application/json' },
      body: '{"url":',
    });
    expect(bad.status).toBe(400);
    const text = await call('/api/links', { method: 'POST', headers: ADMIN, body: 'x' });
    expect(text.status).toBe(415);
  });

  it('deletes from D1 and evicts the KV entry', async () => {
    await postJson('/api/links', { url: 'https://example.com', slug: 'gone' });
    await call('/gone'); // warm the cache
    const deleted = await call('/api/links/gone', { method: 'DELETE', headers: ADMIN });
    expect(deleted.status).toBe(204);
    expect(await env.LINKS_CACHE.get('link:gone')).toBeNull();
    expect((await call('/gone')).status).toBe(404);
  });

  it('purges expired links on the cron trigger', async () => {
    await env.DB.prepare("INSERT INTO links (slug, url, expires_at) VALUES ('old', 'https://x.dev/', 1)").run();
    const ctx = createExecutionContext();
    await worker.scheduled(createScheduledController({ cron: '0 3 * * *' }), env, ctx);
    await waitOnExecutionContext(ctx);
    const row = await env.DB.prepare("SELECT slug FROM links WHERE slug = 'old'").first();
    expect(row).toBeNull();
  });
});
