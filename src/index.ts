import { json } from './http';
import { createLink, deleteLink, getLink, purgeExpired, redirect } from './links';
import { getFile, putFile } from './files';
import { Router } from './router';

const router = new Router()
  .get('/health', (request, env) =>
    json({ status: 'ok', name: env.APP_NAME, colo: request.cf?.colo ?? 'local' }),
  )
  .post('/api/links', createLink)
  .get('/api/links/:slug', getLink)
  .delete('/api/links/:slug', deleteLink)
  .put('/api/files/:key', putFile)
  .get('/files/:key', getFile)
  .get('/:slug', redirect);

export default {
  fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      purgeExpired(env).then((removed) =>
        console.log(JSON.stringify({ msg: 'purged expired links', cron: controller.cron, removed })),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
