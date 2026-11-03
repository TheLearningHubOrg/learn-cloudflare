import { HttpError } from './http';

const encoder = new TextEncoder();

/**
 * Constant-time comparison of two strings. Hashing first gives both inputs the
 * same length, which crypto.subtle.timingSafeEqual requires.
 */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

/** Throws 401 unless the request carries `Authorization: Bearer <ADMIN_TOKEN>`. */
export async function requireAdmin(request: Request, env: Env): Promise<void> {
  // Fail closed: an unset secret must never mean "no auth".
  if (!env.ADMIN_TOKEN) throw new HttpError(401, 'Admin token is not configured');

  const header = request.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || !(await safeEqual(token, env.ADMIN_TOKEN))) {
    throw new HttpError(401, 'Missing or invalid bearer token');
  }
}
