# Runs the bundled Worker in workerd (Cloudflare's open-source Workers runtime)
# through Miniflare, with KV, D1 and R2 stored on local disk. On Cloudflare you
# deploy with `wrangler deploy`; this image is for CI smoke tests and for
# running the same bundle off-platform.
#
# workerd ships glibc binaries only, so every stage uses Debian-based
# node:24-slim rather than Alpine (musl).

# ---- deps: production dependencies only (miniflare + workerd) --------------
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- build: bundle the Worker with Wrangler, compile the Node runner ------
FROM node:24-slim AS build
ENV WRANGLER_SEND_METRICS=false \
    CI=true
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# wrangler deploy --dry-run --outdir dist/worker && tsc -p tsconfig.server.json
RUN npm run build

# ---- runtime ----------------------------------------------------------------
FROM node:24-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080 \
    PERSIST_DIR=/data
WORKDIR /app
RUN mkdir -p /data && chown node:node /data
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/migrations ./migrations
USER node
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "dist/server.js"]
