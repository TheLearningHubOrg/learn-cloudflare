import { requireAdmin } from './auth';
import { errorResponse, HttpError, json } from './http';
import type { Handler } from './router';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const KEY_PATTERN = /^[\w.-]{1,128}$/;

function keyFrom(params: Record<string, string | undefined>): string {
  const key = params.key ?? '';
  if (!KEY_PATTERN.test(key)) throw new HttpError(400, 'Invalid object key');
  return key;
}

/** PUT /api/files/:key - stream the request body straight into R2. */
export const putFile: Handler = async (request, env, _ctx, params) => {
  await requireAdmin(request, env);
  const key = keyFrom(params);
  const length = Number(request.headers.get('content-length'));
  if (!length) throw new HttpError(411, 'Content-Length is required');
  if (length > MAX_UPLOAD_BYTES) throw new HttpError(413, 'File is larger than 10 MiB');

  const object = await env.FILES.put(key, request.body, {
    httpMetadata: { contentType: request.headers.get('content-type') ?? 'application/octet-stream' },
  });
  return json({ key: object.key, size: object.size, etag: object.httpEtag }, { status: 201 });
};

/** GET /files/:key - serve from R2 with ETag and conditional request support. */
export const getFile: Handler = async (request, env, _ctx, params) => {
  const key = keyFrom(params);
  // onlyIf evaluates If-None-Match / If-Modified-Since inside R2.
  const object = await env.FILES.get(key, { onlyIf: request.headers });
  if (object === null) return errorResponse(404, `No file named "${key}"`);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=300');

  // When the precondition fails R2 returns metadata without a body.
  if (!('body' in object)) return new Response(null, { status: 304, headers });
  return new Response(object.body, { headers });
};
