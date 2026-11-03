/** An error that already knows which HTTP status it maps to. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** JSON response with the right content type. */
export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

/** Uniform error envelope: { "error": { "status": 404, "message": "..." } }. */
export function errorResponse(status: number, message: string): Response {
  return json({ error: { status, message } }, { status });
}

/** Parse a JSON body, turning malformed input into a 400 instead of a 500. */
export async function readJson(request: Request): Promise<unknown> {
  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) {
    throw new HttpError(415, 'Expected content-type: application/json');
  }
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Body is not valid JSON');
  }
}
