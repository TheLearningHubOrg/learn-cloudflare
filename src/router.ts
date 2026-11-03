import { errorResponse, HttpError } from './http';

export type Params = Record<string, string | undefined>;

export type Handler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  params: Params,
) => Response | Promise<Response>;

interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
}

/**
 * A minimal router on top of the standard URLPattern API.
 * Routes match in registration order; the first match wins.
 */
export class Router {
  readonly #routes: Route[] = [];

  on(method: string, pathname: string, handler: Handler): this {
    this.#routes.push({ method, pattern: new URLPattern({ pathname }), handler });
    return this;
  }

  get(pathname: string, handler: Handler): this {
    return this.on('GET', pathname, handler);
  }

  post(pathname: string, handler: Handler): this {
    return this.on('POST', pathname, handler);
  }

  put(pathname: string, handler: Handler): this {
    return this.on('PUT', pathname, handler);
  }

  delete(pathname: string, handler: Handler): this {
    return this.on('DELETE', pathname, handler);
  }

  async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    let pathMatched = false;

    for (const route of this.#routes) {
      const match = route.pattern.exec({ pathname: url.pathname });
      if (!match) continue;
      pathMatched = true;
      // HEAD is answered by the GET handler; the runtime drops the body.
      const method = request.method === 'HEAD' ? 'GET' : request.method;
      if (route.method !== method) continue;

      try {
        return await route.handler(request, env, ctx, match.pathname.groups);
      } catch (err) {
        if (err instanceof HttpError) return errorResponse(err.status, err.message);
        console.error(JSON.stringify({ msg: 'unhandled error', path: url.pathname, err: String(err) }));
        return errorResponse(500, 'Internal Server Error');
      }
    }

    return pathMatched
      ? errorResponse(405, `Method ${request.method} not allowed`)
      : errorResponse(404, 'Not Found');
  }
}
