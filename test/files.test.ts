import { describe, expect, it } from 'vitest';
import { ADMIN, call } from './helpers';

describe('files in R2', () => {
  it('stores an upload and serves it with an ETag', async () => {
    const body = 'hello from R2';
    const put = await call('/api/files/hello.txt', {
      method: 'PUT',
      headers: { ...ADMIN, 'content-type': 'text/plain', 'content-length': String(body.length) },
      body,
    });
    expect(put.status).toBe(201);

    const get = await call('/files/hello.txt');
    expect(get.status).toBe(200);
    expect(get.headers.get('content-type')).toBe('text/plain');
    expect(await get.text()).toBe(body);

    const etag = get.headers.get('etag') ?? '';
    const revalidate = await call('/files/hello.txt', { headers: { 'if-none-match': etag } });
    expect(revalidate.status).toBe(304);
  });

  it('returns 404 for a missing object and 400 for a bad key', async () => {
    expect((await call('/files/nope.bin')).status).toBe(404);
    expect((await call('/files/a%20b')).status).toBe(400);
  });
});
