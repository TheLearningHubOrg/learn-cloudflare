// Stage 1 exercise: a GET /version route.
// Wire it up in src/index.ts with: .get('/version', version)
import { json } from '../src/http';
import type { Handler } from '../src/router';

export const version: Handler = (request, env) =>
  json({
    name: env.APP_NAME,
    // "Cloudflare-Workers" on the edge and in workerd locally.
    runtime: navigator.userAgent,
    colo: request.cf?.colo ?? 'local',
  });
