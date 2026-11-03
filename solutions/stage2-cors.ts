// Stage 2 exercise: wrap any handler with CORS for a fixed allow-list of origins,
// and answer preflight requests without running the handler.
import type { Handler } from '../src/router';

export function withCors(handler: Handler, allowedOrigins: readonly string[]): Handler {
  return async (request, env, ctx, params) => {
    const origin = request.headers.get('origin');
    const allowed = origin !== null && allowedOrigins.includes(origin);

    if (request.method === 'OPTIONS') {
      if (!allowed) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-methods': 'GET, POST, PUT, DELETE',
          'access-control-allow-headers': 'authorization, content-type',
          'access-control-max-age': '86400',
          vary: 'Origin',
        },
      });
    }

    const response = await handler(request, env, ctx, params);
    if (!allowed) return response;
    // Responses from fetch() or Response.redirect() have immutable headers, so copy first.
    const copy = new Response(response.body, response);
    copy.headers.set('access-control-allow-origin', origin);
    copy.headers.append('vary', 'Origin');
    return copy;
  };
}
