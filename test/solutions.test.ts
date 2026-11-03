import { createExecutionContext, env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { json } from '../src/http';
import { version } from '../solutions/stage1-version';
import { withCors } from '../solutions/stage2-cors';
import { listLinks } from '../solutions/stage3-list';
import { ADMIN } from './helpers';

const ctx = () => createExecutionContext();
type Page = { links: { slug: string }[]; next: string | null };

describe('stage 1 solution', () => {
  it('reports the runtime user agent', async () => {
    const response = await version(new Request('https://sho.rt/version'), env, ctx(), {});
    expect(await response.json()).toMatchObject({
      name: 'learn-cloudflare',
      runtime: 'Cloudflare-Workers',
    });
  });
});

describe('stage 2 solution', () => {
  const handler = withCors(() => json({ ok: true }), ['https://app.example']);

  it('answers an allowed preflight with 204', async () => {
    const request = new Request('https://sho.rt/api/links', {
      method: 'OPTIONS',
      headers: { origin: 'https://app.example' },
    });
    const response = await handler(request, env, ctx(), {});
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('https://app.example');
  });

  it('leaves responses for other origins untouched', async () => {
    const request = new Request('https://sho.rt/x', { headers: { origin: 'https://evil.example' } });
    const response = await handler(request, env, ctx(), {});
    expect(response.headers.has('access-control-allow-origin')).toBe(false);
  });
});

describe('stage 3 solution', () => {
  it('pages through links with a cursor', async () => {
    const insert = env.DB.prepare('INSERT INTO links (slug, url) VALUES (?1, ?2)');
    await env.DB.batch(['aaa', 'bbb', 'ccc'].map((s) => insert.bind(s, `https://${s}.dev/`)));

    const first = await listLinks(
      new Request('https://sho.rt/api/links?limit=2', { headers: ADMIN }),
      env,
      ctx(),
      {},
    );
    const page1 = await first.json<Page>();
    expect(page1.links.map((l) => l.slug)).toEqual(['aaa', 'bbb']);
    expect(page1.next).toBe('bbb');

    const second = await listLinks(
      new Request(`https://sho.rt/api/links?limit=2&after=${page1.next}`, { headers: ADMIN }),
      env,
      ctx(),
      {},
    );
    const page2 = await second.json<Page>();
    expect(page2.links.map((l) => l.slug)).toEqual(['ccc']);
    expect(page2.next).toBeNull();
  });
});
