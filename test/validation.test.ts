import { describe, expect, it } from 'vitest';
import { HttpError } from '../src/http';
import { parseNewLink, randomSlug, SLUG_PATTERN } from '../src/validation';

describe('parseNewLink', () => {
  it('normalises a valid URL', () => {
    expect(parseNewLink({ url: 'https://Example.com' })).toEqual({
      url: 'https://example.com/',
      slug: undefined,
      ttlSeconds: undefined,
    });
  });

  it.each([
    [null, 'Body must be a JSON object'],
    [{}, '"url" is required'],
    [{ url: 'not a url' }, 'not a valid absolute URL'],
    [{ url: 'javascript:alert(1)' }, 'must use http or https'],
    [{ url: 'https://a.dev', slug: 'API' }, '"slug" must be'],
    [{ url: 'https://a.dev', slug: 'api' }, '"slug" must be'],
    [{ url: 'https://a.dev', ttlSeconds: 5 }, '"ttlSeconds" must be'],
  ])('rejects %j', (body, message) => {
    expect(() => parseNewLink(body)).toThrow(HttpError);
    expect(() => parseNewLink(body)).toThrow(message);
  });
});

describe('randomSlug', () => {
  it('produces slugs the validator accepts', () => {
    for (let i = 0; i < 100; i++) expect(randomSlug()).toMatch(SLUG_PATTERN);
  });
});
