import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../src/index';

// Request whose `cf` property is typed like the one the edge attaches.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

export const ADMIN = { authorization: 'Bearer test-token' };

/**
 * Call the Worker's fetch handler directly and wait for every ctx.waitUntil()
 * promise, so background writes are visible to the assertions that follow.
 */
export async function call(
  path: string,
  init: RequestInit<IncomingRequestCfProperties> = {},
): Promise<Response> {
  const request = new IncomingRequest(`https://sho.rt${path}`, init);
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

export function postJson(path: string, body: unknown, headers: HeadersInit = ADMIN) {
  return call(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}
