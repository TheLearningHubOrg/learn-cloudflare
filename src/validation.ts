import { HttpError } from './http';

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,31}$/;
const RESERVED = new Set(['api', 'files', 'health']);
const MAX_TTL_SECONDS = 60 * 60 * 24 * 365;

export interface NewLink {
  url: string;
  slug?: string;
  ttlSeconds?: number;
}

/** Narrow an unknown JSON body to a NewLink, or throw a 400 that says why. */
export function parseNewLink(body: unknown): NewLink {
  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, 'Body must be a JSON object');
  }
  const { url, slug, ttlSeconds } = body as Record<string, unknown>;

  if (typeof url !== 'string') throw new HttpError(400, '"url" is required');
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new HttpError(400, '"url" is not a valid absolute URL');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new HttpError(400, '"url" must use http or https');
  }

  if (slug !== undefined) {
    if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug) || RESERVED.has(slug)) {
      throw new HttpError(400, '"slug" must be 3-32 chars of a-z, 0-9 and "-", and not reserved');
    }
  }

  if (ttlSeconds !== undefined) {
    if (!Number.isInteger(ttlSeconds) || (ttlSeconds as number) < 60 || (ttlSeconds as number) > MAX_TTL_SECONDS) {
      throw new HttpError(400, `"ttlSeconds" must be an integer between 60 and ${MAX_TTL_SECONDS}`);
    }
  }

  return { url: parsed.toString(), slug, ttlSeconds: ttlSeconds as number | undefined };
}

/** Random, URL-safe slug from the Web Crypto CSPRNG. */
export function randomSlug(length = 7): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
