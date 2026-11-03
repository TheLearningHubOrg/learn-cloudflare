# Learn Cloudflare 🚀

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Wrangler Version](https://img.shields.io/badge/Wrangler-4.x-F38020.svg?logo=cloudflare)](https://developers.cloudflare.com/workers/wrangler/)
[![CI](https://github.com/TheLearningHubOrg/learn-cloudflare/actions/workflows/ci.yml/badge.svg)](https://github.com/TheLearningHubOrg/learn-cloudflare/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/TheLearningHubOrg/learn-cloudflare)](https://github.com/TheLearningHubOrg/learn-cloudflare/releases)
[![Workers Runtime](https://img.shields.io/badge/Runtime-workerd%20%7C%20V8%20isolates-purple.svg)](https://developers.cloudflare.com/workers/reference/how-workers-works/)
[![TypeScript](https://img.shields.io/badge/Examples-TypeScript-3178C6.svg?logo=typescript)](https://developers.cloudflare.com/workers/languages/typescript/)

**From your first Worker to staff-level architecture on Cloudflare's developer platform.**  
V8 isolate Workers, Wrangler, KV, D1, R2, Durable Objects, Queues, Workflows, Workers AI, Zero Trust and edge networking, with a tested TypeScript starter that runs in workerd.

[Getting Started](#1-stage-1-platform-foundations-wrangler-and-the-workers-runtime) • [Runtime APIs](#2-stage-2-workers-runtime-apis-requests-responses-bindings-and-handlers) • [Storage](#3-stage-3-storage-at-the-edge-kv-d1-r2-and-hyperdrive) • [Stateful Compute](#4-stage-4-stateful-and-asynchronous-compute-durable-objects-queues-and-workflows) • [Network & Security](#5-stage-5-networking-security-and-zero-trust) • [Operations](#6-stage-6-observability-cicd-performance-and-cost) • [Interview Prep](#7-stage-7-staff-cloudflare-platform-engineer-interview-handbook--cheatsheet)

<br/>

<a href="https://www.buymeacoffee.com/manthanank">
  <img src="public/bmc-button.svg" alt="Buy Me A Coffee" width="180">
</a>

</div>

---

> **Language used in this guide: TypeScript.** Workers run JavaScript and WebAssembly inside V8, and Cloudflare's own tooling is built around TypeScript: `npm create cloudflare` scaffolds TypeScript, `wrangler types` generates the runtime and binding types, and the Vitest plugin runs `.ts` tests inside workerd. Rust (`workers-rs`, compiled to Wasm) and Python Workers (Pyodide) also exist, but they wrap the same JavaScript APIs and lag behind them, so every example and the starter project here are TypeScript. Infrastructure snippets use the platform's own formats: `wrangler.jsonc`, SQL for D1, and the `wrangler` CLI.

## 🗺️ 7-Stage Pedagogical Roadmap

```mermaid
flowchart LR
    S1["Stage 1: Foundations"] --> S2["Stage 2: Runtime APIs"]
    S2 --> S3["Stage 3: Storage"]
    S3 --> S4["Stage 4: Stateful Compute"]
    S4 --> S5["Stage 5: Network & Security"]
    S5 --> S6["Stage 6: Operations"]
    S6 --> M["Masterclasses M1-M5"]
    M --> S7["Stage 7: Staff Interview Handbook"]
```

| Stage | Focus Domain | Core Concepts & Engineering Outcomes |
| :--- | :--- | :--- |
| **Stage 1** | **Platform Foundations, Wrangler & the Workers Runtime** | Anycast network and the request path, V8 isolates vs containers, CPU time vs wall time, `npm create cloudflare`, `wrangler dev`/`deploy`/`rollback`, `wrangler.jsonc`, compatibility dates and flags, environments, routes and custom domains. Outcome: deploy and roll back the starter Worker. |
| **Stage 2** | **Workers Runtime APIs** | Module Worker handlers (`fetch`, `scheduled`, `queue`), `Request`/`Response`/`Headers`, `URLPattern` routing, bindings, vars and secrets, `wrangler types`, `ctx.waitUntil()`, subrequests and `cf` options, streams and `HTMLRewriter`, the Cache API, Cron Triggers, service bindings and RPC, `nodejs_compat`. Outcome: a typed, routed, tested API Worker. |
| **Stage 3** | **Storage at the Edge** | KV consistency and read-through caching, D1 queries, `batch()`, migrations and read replication with the Sessions API, R2 objects with conditional GETs, ranges, multipart and presigned URLs, Hyperdrive for existing PostgreSQL, testing storage with `@cloudflare/vitest-plugin`. Outcome: the starter's link shortener on KV + D1 + R2. |
| **Stage 4** | **Stateful and Asynchronous Compute** | Durable Objects with SQLite storage, alarms and WebSocket hibernation, Queues with batching, retries and DLQs, Workflows with durable steps, Cron Triggers at scale. |
| **Stage 5** | **Networking, Security & Zero Trust** | DNS and proxy modes, cache rules, WAF and rate limiting, Turnstile, mTLS, Cloudflare Access and Tunnel, Workers static assets vs Pages, secrets management. |
| **Stage 6** | **Observability, CI/CD, Performance & Cost** | Workers Logs and `wrangler tail`, traces, Analytics Engine, gradual deployments and versions, GitHub Actions deploys, Smart Placement, limits and pricing models. |
| **Masterclasses** | **Isolate internals, Durable Objects at scale, AI on the edge, Containers, flagship blueprint** | Deep dives into how workerd schedules isolates, DO-based coordination patterns, Workers AI + Vectorize + AI Gateway, Containers for workloads isolates cannot run, and an end-to-end production build. |
| **Stage 7** | **Staff Interview Handbook** | 40+ staff-level Q&As on internals, failure modes, consistency and cost, scenario debugging, and a one-page cheatsheet. |

---

## 🆕 Cloudflare Versions, What's New & Migration

Cloudflare's platform has no single version number. Three things version independently and you should track all of them:

| What versions | How | Where you pin it |
| --- | --- | --- |
| The Workers runtime (workerd) | Rolling releases several times a week; behaviour changes are gated behind dated **compatibility flags** | `compatibility_date` and `compatibility_flags` in `wrangler.jsonc` |
| Wrangler (the CLI and bundler) | Semver; major 4 is current stable | `devDependencies` in `package.json` and the lockfile |
| Product APIs (KV, D1, R2, Durable Objects, Queues, ...) | Additive changes, beta → GA transitions | Binding types generated by `wrangler types` |

### V.1 Release Timeline

```mermaid
timeline
    title Cloudflare developer platform milestones used in this guide
    section 2017-2020
      Workers launch (2017) : JavaScript on V8 isolates in every data centre
      Workers KV (2018) : Global, eventually consistent key-value store
      Durable Objects beta (2020) : Single-instance stateful objects
    section 2022-2023
      R2 GA (2022) : S3-compatible storage with no egress fees
      workerd open-sourced (2022) : The runtime behind Workers runs locally
      Wrangler 3 (2023) : wrangler dev runs on workerd by default
    section 2024
      D1 GA (Apr 2024) : Serverless SQLite databases
      Hyperdrive GA (Apr 2024) : Pooled access to existing PostgreSQL
      Node.js compat v2 (Sep 2024) : nodejs_compat with polyfills built in
      Workers static assets (Sep 2024) : Front ends served by Workers directly
    section 2025
      Wrangler 4 (Mar 2025) : Removed legacy commands, local-first storage commands
      SQLite-backed Durable Objects GA (Apr 2025) : SQL inside every object
      Workflows GA (Apr 2025) : Durable multi-step execution
    section Current stable
      Wrangler 4.x : wrangler types replaces workers-types, Vitest plugin rename
```

### V.2 Compatibility Matrix

| Component | Version in this repo | Supported range / status | Notes |
| --- | --- | --- | --- |
| Wrangler | 4.x (current stable, lockfile pins the exact release) | Wrangler 3 receives only critical fixes | Requires Node.js 22 or later |
| Node.js (for tooling only) | 22 and 24 in CI | Active LTS lines | Your Worker does not run on Node.js; Wrangler and the tests do |
| workerd | Pinned by Wrangler | Follows Wrangler | Same runtime as production, minus the network, limits and some products |
| `compatibility_date` | `2026-07-01` | Any past date; Cloudflare keeps old behaviour for old dates | A date newer than the local workerd build fails `wrangler dev` |
| `@cloudflare/vitest-plugin` | 1.x | Vitest 4 and 5 | Replaces `@cloudflare/vitest-pool-workers` |
| TypeScript | current stable | `wrangler types` output works with any recent TypeScript | Drop `@cloudflare/workers-types` from `types` |
| Miniflare | 4.x (runtime dependency of the Docker image) | Wrangler embeds its own copy | Only needed directly when you host workerd yourself |

### V.3 What's New in Current Stable

#### Generated runtime types replace `@cloudflare/workers-types`

`wrangler types` now writes one file with your bindings **and** the runtime API types that match your `compatibility_date` and flags. The old package described "latest" APIs whether or not your date enabled them.

Before:

```jsonc
// tsconfig.json
{ "compilerOptions": { "types": ["@cloudflare/workers-types/2023-07-01"] } }
```

```ts
// Hand-written and easy to forget when wrangler.jsonc changes
interface Env {
  DB: D1Database;
  LINKS_CACHE: KVNamespace;
}
```

After:

```bash
npx wrangler types            # writes worker-configuration.d.ts
npx wrangler types --check    # CI: fail if the file is stale
```

```jsonc
// tsconfig.json
{ "compilerOptions": { "types": ["./worker-configuration.d.ts"] } }
```

#### The Vitest integration is a plugin, and `SELF` gives way to `exports`

`@cloudflare/vitest-pool-workers` was renamed to `@cloudflare/vitest-plugin`. Configuration moves from a custom `defineWorkersConfig()` to a normal Vite plugin, and integration tests call the Worker through `exports` from `cloudflare:workers` instead of the deprecated `SELF`.

Before:

```ts
// vitest.config.ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: { poolOptions: { workers: { wrangler: { configPath: './wrangler.jsonc' } } } },
});
```

```ts
import { SELF } from 'cloudflare:test';
const res = await SELF.fetch('https://example.com/health');
```

After (this repo's [vitest.config.ts](vitest.config.ts) and [test/worker.test.ts](test/worker.test.ts)):

```ts
import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
});
```

```ts
import { exports } from 'cloudflare:workers';
const res = await exports.default.fetch('https://example.com/health');
```

#### Workers static assets instead of a separate Pages project

A Worker can serve a directory of static files itself. Requests that match a file never invoke your code (and are not billed as Worker invocations); everything else falls through to `fetch`. New full-stack projects should start here rather than on Pages.

Before (Pages Functions, file-based routing):

```ts
// functions/api/hello.ts
export const onRequestGet: PagesFunction = () => Response.json({ hello: 'world' });
```

After:

```jsonc
// wrangler.jsonc
{
  "name": "my-app",
  "main": "src/index.ts",
  "compatibility_date": "2026-07-01",
  "assets": { "directory": "./public", "binding": "ASSETS", "not_found_handling": "single-page-application" }
}
```

```ts
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/hello') return Response.json({ hello: 'world' });
    return env.ASSETS.fetch(request); // explicit fallback, for example after an auth check
  },
} satisfies ExportedHandler<Env>;
```

#### Bindings importable at module scope

`import { env } from 'cloudflare:workers'` gives top-level code and helper modules access to bindings without threading `env` through every call. Values are still per-deployment configuration, not per-request state.

```ts
import { env } from 'cloudflare:workers';

// Before: every helper took env as a parameter.
export async function getFlag(name: string) {
  return env.FLAGS.get(name);
}
```

#### SQLite-backed Durable Objects and D1 read replication

New Durable Object classes declared with `new_sqlite_classes` get a private SQLite database (`ctx.storage.sql.exec()`), and D1 can serve reads from replicas near users when queries go through `env.DB.withSession()`. Both are covered in Stage 3 and Stage 4.

### V.4 Migration Guide (Wrangler 3 → 4, legacy tooling → current stable)

```bash
# 1. Upgrade the CLI (Node.js 22+ required).
npm install --save-dev wrangler@4

# 2. Replace renamed or removed commands in scripts and CI.
#    wrangler publish            -> wrangler deploy
#    wrangler kv:namespace create -> wrangler kv namespace create
#    wrangler kv:key put          -> wrangler kv key put --remote
#    wrangler generate            -> npm create cloudflare@latest
grep -rn "wrangler publish\|kv:namespace\|kv:key\|wrangler generate" package.json .github/

# 3. Storage commands are local by default in Wrangler 4. Add --remote for production data.
npx wrangler kv key list --binding LINKS_CACHE --remote
npx wrangler r2 object get learn-cloudflare-files/hello.txt --remote

# 4. Move to generated types.
npm uninstall @cloudflare/workers-types
npx wrangler types
# then set "types": ["./worker-configuration.d.ts"] in tsconfig.json

# 5. Rename the test integration (official codemod), then update imports of SELF.
npx @cloudflare/codemods vitest:pool-workers-to-vitest-plugin

# 6. Optional: convert wrangler.toml to wrangler.jsonc. Both work; new features
#    and templates document JSONC first, and the $schema line gives editor completion.
```

Raise `compatibility_date` as a separate change from the Wrangler upgrade, run the tests, and read the [compatibility flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/) that turn on between your old and new date. That keeps "the tool changed" and "the runtime changed" in different commits.

### V.5 Deprecations & Breaking Changes

| Version | Deprecated / removed | Replacement | What breaks and how to fix it |
| --- | --- | --- | --- |
| Wrangler 4 | `wrangler publish` | `wrangler deploy` | CI scripts fail with an unknown-command error; rename the command |
| Wrangler 4 | Colon commands (`kv:namespace`, `kv:key`, `kv:bulk`) | Space-separated (`kv namespace`, `kv key`, `kv bulk`) | Same, rename |
| Wrangler 4 | Remote-by-default `kv`/`r2` object commands | Local by default, `--remote` opt-in | A script that "worked" now writes to local `.wrangler/state`; add `--remote` |
| Wrangler 4 | `node_compat = true` (bundler polyfills) | `"compatibility_flags": ["nodejs_compat"]` | Config error on load; switch to the runtime flag |
| Wrangler 4 | `wrangler generate` | `npm create cloudflare@latest` (C3); `wrangler init` now delegates to C3 | Unknown-command error; scaffold with C3 |
| Current stable | `@cloudflare/workers-types` as the primary type source | `wrangler types` | Types drift from your compatibility date; regenerate and check in CI |
| Current stable | `@cloudflare/vitest-pool-workers` | `@cloudflare/vitest-plugin` | No further updates to the old package; run the codemod |
| Current stable | `SELF` from `cloudflare:test` | `exports.default` from `cloudflare:workers` | Still works but marked deprecated |
| Long-standing | Service Worker syntax (`addEventListener('fetch', ...)`) | ES module `export default { fetch }` | Needed for Durable Objects, RPC, Workflows and most new features |
| Long-standing | Pages for new full-stack apps | Workers with static assets | Pages keeps working; new platform features land on Workers first |

---

## 📋 Table of Contents

- [🆕 Versions, What's New & Migration](#-cloudflare-versions-whats-new--migration)
- [1. Stage 1: Platform Foundations, Wrangler and the Workers Runtime](#1-stage-1-platform-foundations-wrangler-and-the-workers-runtime)
  - [1.1 What Cloudflare's Developer Platform Is](#11-what-cloudflares-developer-platform-is)
  - [1.2 The Isolate Execution Model](#12-the-isolate-execution-model)
  - [1.3 Installation & First Run](#13-installation--first-run)
  - [1.4 Line-by-Line Breakdown of the Starter Project](#14-line-by-line-breakdown-of-the-starter-project)
  - [1.5 `wrangler.jsonc` Anatomy: Names, Compatibility Dates and Flags](#15-wranglerjsonc-anatomy-names-compatibility-dates-and-flags)
  - [1.6 Environments, Routes, `workers.dev` and Custom Domains](#16-environments-routes-workersdev-and-custom-domains)
  - [1.7 The Request Lifecycle at the Edge](#17-the-request-lifecycle-at-the-edge)
  - [1.8 Local Development: `wrangler dev`, Miniflare and workerd](#18-local-development-wrangler-dev-miniflare-and-workerd)
  - [1.9 Deploying, Versions and Rolling Back](#19-deploying-versions-and-rolling-back)
  - [1.10 Pitfalls](#110-pitfalls)
  - [1.11 Best Practices](#111-best-practices)
  - [1.12 Hands-on Exercise](#112-hands-on-exercise)
- [2. Stage 2: Workers Runtime APIs: Requests, Responses, Bindings and Handlers](#2-stage-2-workers-runtime-apis-requests-responses-bindings-and-handlers)
  - [2.1 Module Workers and Handler Types](#21-module-workers-and-handler-types)
  - [2.2 `Request`, `Response`, `Headers` and `URL`](#22-request-response-headers-and-url)
  - [2.3 Routing with `URLPattern`](#23-routing-with-urlpattern)
  - [2.4 Bindings, Vars and Secrets](#24-bindings-vars-and-secrets)
  - [2.5 `ExecutionContext`: `waitUntil` and `passThroughOnException`](#25-executioncontext-waituntil-and-passthroughonexception)
  - [2.6 Subrequests with `fetch()`](#26-subrequests-with-fetch)
  - [2.7 Streams and `HTMLRewriter`](#27-streams-and-htmlrewriter)
  - [2.8 The Cache API vs the CDN Cache](#28-the-cache-api-vs-the-cdn-cache)
  - [2.9 Scheduled Handlers and Cron Triggers](#29-scheduled-handlers-and-cron-triggers)
  - [2.10 Service Bindings and RPC](#210-service-bindings-and-rpc)
  - [2.11 Node.js Compatibility](#211-nodejs-compatibility)
  - [2.12 Errors, Logging and Observability Basics](#212-errors-logging-and-observability-basics)
  - [2.13 Pitfalls](#213-pitfalls)
  - [2.14 Best Practices](#214-best-practices)
  - [2.15 Hands-on Exercise](#215-hands-on-exercise)
- [3. Stage 3: Storage at the Edge: KV, D1, R2 and Hyperdrive](#3-stage-3-storage-at-the-edge-kv-d1-r2-and-hyperdrive)
  - [3.1 Choosing a Data Store](#31-choosing-a-data-store)
  - [3.2 Workers KV: Model and Consistency](#32-workers-kv-model-and-consistency)
  - [3.3 The KV API and the Starter's Read-Through Cache](#33-the-kv-api-and-the-starters-read-through-cache)
  - [3.4 KV Patterns: Metadata, Listing and Expiry](#34-kv-patterns-metadata-listing-and-expiry)
  - [3.5 D1: SQLite as a Service](#35-d1-sqlite-as-a-service)
  - [3.6 Querying D1: `prepare`, `bind`, `first`, `all`, `run`, `batch`](#36-querying-d1-prepare-bind-first-all-run-batch)
  - [3.7 D1 Migrations and Schema Evolution](#37-d1-migrations-and-schema-evolution)
  - [3.8 D1 Read Replication and the Sessions API](#38-d1-read-replication-and-the-sessions-api)
  - [3.9 R2: Object Storage Without Egress Fees](#39-r2-object-storage-without-egress-fees)
  - [3.10 R2 Patterns: Ranges, Listing, Multipart and Presigned URLs](#310-r2-patterns-ranges-listing-multipart-and-presigned-urls)
  - [3.11 Hyperdrive: Existing PostgreSQL and MySQL from Workers](#311-hyperdrive-existing-postgresql-and-mysql-from-workers)
  - [3.12 Testing Storage with the Vitest Plugin](#312-testing-storage-with-the-vitest-plugin)
  - [3.13 Pitfalls](#313-pitfalls)
  - [3.14 Best Practices](#314-best-practices)
  - [3.15 Hands-on Exercise](#315-hands-on-exercise)
- [4. Stage 4: Stateful and Asynchronous Compute: Durable Objects, Queues and Workflows](#4-stage-4-stateful-and-asynchronous-compute-durable-objects-queues-and-workflows)
- [5. Stage 5: Networking, Security and Zero Trust](#5-stage-5-networking-security-and-zero-trust)
- [6. Stage 6: Observability, CI/CD, Performance and Cost](#6-stage-6-observability-cicd-performance-and-cost)
- [M1. Masterclass: Inside workerd: Isolates, Scheduling and Limits](#m1-masterclass-inside-workerd-isolates-scheduling-and-limits)
- [M2. Masterclass: Durable Objects at Scale: Coordination Patterns](#m2-masterclass-durable-objects-at-scale-coordination-patterns)
- [M3. Masterclass: AI on the Edge: Workers AI, Vectorize and AI Gateway](#m3-masterclass-ai-on-the-edge-workers-ai-vectorize-and-ai-gateway)
- [M4. Masterclass: Containers and Hybrid Architectures](#m4-masterclass-containers-and-hybrid-architectures)
- [M5. Masterclass: Flagship Blueprint: A Production Link Platform](#m5-masterclass-flagship-blueprint-a-production-link-platform)
- [7. Stage 7: Staff Cloudflare Platform Engineer Interview Handbook & Cheatsheet](#7-stage-7-staff-cloudflare-platform-engineer-interview-handbook--cheatsheet)
  - [7.1 Core Concepts (Q1-Q2)](#71-core-concepts-q1-q2)
  - [7.5 Staff Cheatsheet](#75-staff-cheatsheet)
- [🧪 Example Projects](#-example-projects)
- [📝 Cheat Sheets](#-cheat-sheets)
- [📚 Resources](#-resources)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [🌐 Connect with me](#-connect-with-me)
- [☕ Support](#-support)

---

## 1. Stage 1: Platform Foundations, Wrangler and the Workers Runtime

This stage explains where your code actually runs on Cloudflare, why the isolate model behaves differently from containers and Lambda, and how Wrangler takes a TypeScript file to every data centre. You need Node.js 22+, a free Cloudflare account and basic TypeScript. By the end you can run the starter locally, deploy it to `*.workers.dev`, attach a custom domain and roll back a bad release.

```mermaid
flowchart LR
    Dev["src/index.ts"] --> W["wrangler deploy"]
    W --> B["esbuild bundle + metadata"]
    B --> API["Cloudflare API"]
    API --> Store["Script store (versioned)"]
    Store --> PoP1["Data centre A"]
    Store --> PoP2["Data centre B"]
    Store --> PoP3["Data centre ..."]
    User["Browser"] -->|"anycast"| PoP2
```

### 1.1 What Cloudflare's Developer Platform Is

Cloudflare began as a reverse proxy and CDN: you point your DNS at it, and its network terminates TLS, filters attacks and caches responses in front of your origin. The developer platform puts **your code inside that proxy**. A Worker is a function that receives the HTTP request after Cloudflare's security and caching layers and before (or instead of) your origin. Every data centre runs every Worker, so there is no region to choose.

Around Workers sits a set of products that are reached through **bindings** rather than network credentials:

| Need | Product | Model |
| --- | --- | --- |
| Run code per request | Workers | V8 isolates, request-scoped |
| Global config, flags, cache | Workers KV | Eventually consistent key-value |
| Relational data | D1 | Managed SQLite per database |
| Files and blobs | R2 | S3-compatible object storage, no egress fees |
| Coordination and per-entity state | Durable Objects | One single-threaded instance per ID, with storage |
| Background work | Queues | At-least-once message delivery with batching |
| Long-running multi-step jobs | Workflows | Durable steps with retries and sleeps |
| Existing PostgreSQL / MySQL | Hyperdrive | Connection pooling and query caching close to the database |
| Static front ends | Workers static assets (Pages for older projects) | Files served before your code runs |
| Inference and embeddings | Workers AI, Vectorize, AI Gateway | Serverless GPUs, vector index, AI proxy |
| Workloads that need a full OS | Containers | Container instances controlled from a Worker |

How it compares with the platforms people usually weigh it against:

| | Cloudflare Workers | AWS Lambda | Vercel / Netlify functions | Deno Deploy |
| --- | --- | --- | --- | --- |
| Isolation unit | V8 isolate | Firecracker micro-VM | Lambda or isolates depending on runtime | V8 isolate |
| Cold start | Usually hidden by the TLS handshake | Hundreds of ms to seconds | Varies by runtime | Low |
| Placement | Every Cloudflare location, or near your data with Smart Placement | One region per function | Region or edge depending on runtime | Global |
| Languages | JS/TS, Wasm (Rust, Go, C), Python | Almost anything | JS/TS mainly | JS/TS |
| Billing | Requests + CPU time; idle I/O wait is free | Requests + GB-seconds of wall time | Per invocation and duration | Requests + CPU |
| State | KV, D1, R2, Durable Objects via bindings | DynamoDB, S3, RDS via SDKs | Third-party databases | Deno KV, third-party |

The practical consequence: Workers are excellent for latency-sensitive request handling, APIs, auth gateways, personalisation and glue between services. They are a poor fit for long CPU-bound jobs, large native dependencies, or software that expects a filesystem and long-lived processes; Containers and Workflows exist for those cases.

### 1.2 The Isolate Execution Model

A V8 **isolate** is an independent JavaScript heap with its own garbage collector, created inside an already-running process. Cloudflare's runtime, **workerd**, runs thousands of isolates from different customers in one process and switches between them on each event. Starting an isolate means compiling your bundle, not booting an OS or a language runtime, which is why cold starts are measured in milliseconds.

```mermaid
flowchart TB
    subgraph Container["Container / micro-VM model"]
        direction TB
        K1["Kernel"] --> R1["Node.js runtime"] --> A1["Your function"]
        K2["Kernel"] --> R2["Node.js runtime"] --> A2["Another function"]
    end
    subgraph Isolates["workerd isolate model"]
        direction TB
        P["One workerd process per machine"] --> I1["Isolate: your Worker"]
        P --> I2["Isolate: customer B"]
        P --> I3["Isolate: customer C"]
    end
```

What this means for your code:

| Property | Behaviour | Why you care |
| --- | --- | --- |
| Memory | 128 MB per isolate | Stream large bodies instead of buffering them |
| CPU time | Measured only while your JavaScript runs; waiting on `fetch`, KV or D1 is not counted | A Worker that waits 20 s on an API can still use 5 ms of CPU |
| CPU limit | 10 ms per invocation on the Free plan; 30 s default on Paid, configurable with `limits.cpu_ms` (up to 5 minutes at time of writing) | CPU-heavy work (image processing, big JSON) needs the Paid plan, Wasm, or a different product |
| Global scope | Runs once per isolate, then reused across requests on that isolate | Put clients and compiled regexes there; never put per-request data there |
| Isolate lifetime | Evicted whenever the runtime wants (memory pressure, deploys, idle) | Module-level caches are best-effort, never a source of truth |
| Concurrency | One isolate can interleave many requests at their `await` points | Shared mutable globals become cross-request data leaks |
| No filesystem, no raw sockets by default | `connect()` from `cloudflare:sockets` for TCP; no `fs` writes | Libraries that write temp files need adapting |

A quick way to see global-scope reuse in action:

```ts
let served = 0; // lives as long as this isolate does

export default {
  async fetch() {
    served += 1;
    // Repeated requests may print 1, 2, 3... or start again at 1 on another isolate.
    return new Response(`this isolate has served ${served} requests`);
  },
} satisfies ExportedHandler;
```

That counter is the right mental model for module-level state: useful for warm caches, wrong for anything that must be correct.

### 1.3 Installation & First Run

Create an account at the Cloudflare dashboard, then:

```bash
# Scaffold a new TypeScript Worker with C3 (create-cloudflare)
npm create cloudflare@latest my-first-worker -- --type=hello-world --lang=ts
cd my-first-worker

# Authenticate Wrangler with your account (opens a browser; use API tokens in CI)
npx wrangler login
npx wrangler whoami

# Local development on workerd, with hot reload, at http://localhost:8787
npx wrangler dev

# Deploy to https://my-first-worker.<your-subdomain>.workers.dev
npx wrangler deploy
```

To run this guide's starter instead:

```bash
git clone https://github.com/TheLearningHubOrg/learn-cloudflare.git
cd learn-cloudflare
npm ci

cp .dev.vars.example .dev.vars        # local-only secret ADMIN_TOKEN
npm run db:migrate:local              # create the D1 schema in .wrangler/state
npm run dev                           # wrangler dev on http://localhost:8787

curl http://localhost:8787/health
curl -X POST http://localhost:8787/api/links \
  -H "authorization: Bearer change-me-local-only" \
  -H "content-type: application/json" \
  -d '{"url":"https://developers.cloudflare.com/workers/","slug":"workers"}'
curl -i http://localhost:8787/workers   # 302 to the docs

npm test                              # Vitest inside workerd
```

The first deploy of the starter needs real resource IDs:

```bash
npx wrangler kv namespace create LINKS_CACHE
npx wrangler d1 create learn-cloudflare-links
npx wrangler r2 bucket create learn-cloudflare-files
# paste the printed ids into wrangler.jsonc, then:
npx wrangler d1 migrations apply DB --remote
npx wrangler secret put ADMIN_TOKEN
npx wrangler deploy
```

| Command | What it does |
| --- | --- |
| `npm create cloudflare@latest` | Runs C3: scaffolds a project from a template, installs Wrangler, optionally deploys |
| `wrangler login` | OAuth flow that stores a token in your user config; CI uses `CLOUDFLARE_API_TOKEN` instead |
| `wrangler dev` | Bundles with esbuild and runs the Worker on local workerd, simulating bindings in `.wrangler/state` |
| `wrangler dev --remote` | Runs your code on Cloudflare's network against real resources; use sparingly |
| `wrangler deploy` | Bundles, uploads a new version, and makes it the active deployment at 100% |
| `wrangler tail` | Streams live `console.log` output and exceptions from production |

### 1.4 Line-by-Line Breakdown of the Starter Project

The starter is a link shortener with file hosting. Its entry point, [src/index.ts](src/index.ts):

```ts
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
```

| Line / API | Role | What happens at runtime |
| :--- | :--- | :--- |
| `const router = new Router()...` | Module scope | Runs once when the isolate loads the bundle; every request on that isolate reuses the compiled `URLPattern`s |
| `.get('/:slug', redirect)` last | Route order | First match wins, so the catch-all slug route must come after `/health` and `/api/...` |
| `request.cf?.colo` | Edge metadata | The IATA code of the data centre that ran this request, such as `BOM` or `FRA`; `cf` is absent in some local contexts |
| `export default { fetch, scheduled }` | Module Worker | The runtime looks up handlers by name on the default export; there is no `listen()` |
| `fetch(request, env, ctx)` | HTTP handler | Called once per request with the request, the bindings and the execution context |
| `scheduled(controller, env, ctx)` | Cron handler | Called by Cron Triggers declared in `wrangler.jsonc`; `controller.cron` is the matching expression |
| `ctx.waitUntil(promise)` | Background work | Keeps the invocation alive until the promise settles, after the response (or cron result) is reported |
| `satisfies ExportedHandler<Env>` | Type check | Types every handler parameter from the generated `Env` without widening the object's own type |

The rest of the starter, which Stages 2 and 3 walk through:

```text
learn-cloudflare/
├── src/
│   ├── index.ts          entry point: routes and handlers
│   ├── router.ts         URLPattern router with 404/405 and error mapping
│   ├── http.ts           json(), HttpError, error envelope, readJson()
│   ├── auth.ts           bearer token check with constant-time comparison
│   ├── validation.ts     input parsing and CSPRNG slugs
│   ├── links.ts          D1 source of truth + KV read-through cache
│   ├── files.ts          R2 uploads and conditional downloads
│   └── secrets.d.ts      types for secrets that wrangler types cannot see
├── migrations/           D1 SQL migrations (wrangler d1 migrations ...)
├── test/                 Vitest suites that run inside workerd
├── solutions/            reference answers for the hands-on exercises
├── server/server.ts      Miniflare runner used by the Docker image
├── wrangler.jsonc        Worker configuration and bindings
└── worker-configuration.d.ts   generated by `wrangler types`
```

### 1.5 `wrangler.jsonc` Anatomy: Names, Compatibility Dates and Flags

The configuration file is the contract between your code and the platform. The starter's [wrangler.jsonc](wrangler.jsonc):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "learn-cloudflare",
  "main": "src/index.ts",
  "compatibility_date": "2026-07-01",
  "observability": { "enabled": true },
  "vars": { "APP_NAME": "learn-cloudflare", "CACHE_TTL_SECONDS": "3600" },
  "kv_namespaces": [{ "binding": "LINKS_CACHE", "id": "<kv-id>" }],
  "d1_databases": [
    { "binding": "DB", "database_name": "learn-cloudflare-links", "database_id": "<d1-id>", "migrations_dir": "migrations" }
  ],
  "r2_buckets": [{ "binding": "FILES", "bucket_name": "learn-cloudflare-files" }],
  "triggers": { "crons": ["0 3 * * *"] }
}
```

| Key | Meaning | Gotcha |
| --- | --- | --- |
| `$schema` | Editor autocompletion and validation | Path is relative to the config file |
| `name` | Worker script name; also the `workers.dev` subdomain prefix | Renaming creates a new Worker; the old one keeps running |
| `main` | Entry module; Wrangler bundles from here | Must export handlers on the default export |
| `compatibility_date` | Freezes runtime behaviour as of that date | Never set it to "today" in a template: newer than your local workerd fails |
| `compatibility_flags` | Opt into (or out of) individual behaviours, e.g. `nodejs_compat` | Flags are listed with the date they became default |
| `observability.enabled` | Turns on Workers Logs for `console.*` output | Sampling is configurable with `head_sampling_rate` |
| `vars` | Plain-text configuration as bindings | Visible in the dashboard; never put secrets here |
| `kv_namespaces`, `d1_databases`, `r2_buckets` | Storage bindings | `binding` is the property name on `env` |
| `triggers.crons` | Cron Triggers in UTC | Changes deploy with the Worker; at most a few per Worker |

**Compatibility dates** are how Cloudflare ships breaking fixes without breaking you. When the runtime changes observable behaviour (for example how `FormData` parses files or whether `nodejs_compat` populates `process.env`), the new behaviour is tied to a date. Workers with an older date keep the old behaviour indefinitely. Raising the date is an explicit upgrade you test, like bumping a dependency.

```mermaid
flowchart LR
    D["compatibility_date 2026-07-01"] --> R{"Flag default date <= 2026-07-01?"}
    R -->|"yes"| On["Behaviour on"]
    R -->|"no"| Off["Behaviour off"]
    F["compatibility_flags"] -->|"explicit flag or no_ flag"| Override["Overrides the date"]
    Override --> On
    Override --> Off
```

### 1.6 Environments, Routes, `workers.dev` and Custom Domains

A Worker becomes reachable in one of three ways:

| Trigger | Configured with | Use for |
| --- | --- | --- |
| `*.workers.dev` subdomain | `"workers_dev": true` (default) | Previews, internal tools |
| Custom Domain | `"routes": [{ "pattern": "sho.rt", "custom_domain": true }]` | The Worker *is* the origin for that hostname; Cloudflare creates DNS and the certificate |
| Route | `"routes": [{ "pattern": "example.com/api/*", "zone_name": "example.com" }]` | The Worker runs in front of an existing origin for matching paths; it can `fetch(request)` to pass through |

Environments let one config describe staging and production with different bindings:

```jsonc
{
  "name": "learn-cloudflare",
  "main": "src/index.ts",
  "compatibility_date": "2026-07-01",
  "vars": { "APP_NAME": "learn-cloudflare" },
  "env": {
    "staging": {
      "vars": { "APP_NAME": "learn-cloudflare-staging" },
      "kv_namespaces": [{ "binding": "LINKS_CACHE", "id": "<staging-kv-id>" }]
    },
    "production": {
      "routes": [{ "pattern": "sho.rt", "custom_domain": true }],
      "kv_namespaces": [{ "binding": "LINKS_CACHE", "id": "<prod-kv-id>" }]
    }
  }
}
```

```bash
npx wrangler deploy --env staging      # deploys a Worker named learn-cloudflare-staging
npx wrangler deploy --env production
```

Bindings and `vars` are **not inherited** into an environment block; each environment must list them again. That is deliberate (no accidental sharing of a production database), and it is the most common reason a staging deploy fails with `env.DB is undefined`.

### 1.7 The Request Lifecycle at the Edge

```mermaid
sequenceDiagram
    participant U as Browser
    participant DNS as Anycast DNS
    participant E as Nearest data centre
    participant S as Security and rules
    participant W as Worker (isolate)
    participant O as Origin or storage
    U->>DNS: resolve sho.rt
    DNS-->>U: Cloudflare anycast IP
    U->>E: TLS handshake + HTTP request
    E->>S: DDoS, WAF, rate limiting, redirect rules
    S->>W: request reaches route or custom domain
    Note over W: isolate is warm or starts during the TLS handshake
    W->>O: fetch(), KV, D1, R2 via bindings
    O-->>W: data
    W-->>E: Response
    E-->>U: Response (Cache Rules may store it)
```

Points that matter in practice:

1. **Anycast** means the same IP is announced from every location, so the user's network routes them to a nearby data centre. There is no geo-DNS step for you to configure.
2. **Security runs before your Worker.** WAF rules, bot management and rate limiting rules on the zone can block a request before it costs you a Worker invocation.
3. **Workers run before the cache on routes.** A Worker on a route sees every matching request; if it calls `fetch(request)`, that subrequest goes through Cloudflare's cache and then to the origin. This is why "my cache rule does nothing" often means a Worker is in front of it.
4. **Isolate start overlaps the TLS handshake.** Cloudflare begins loading the Worker when it sees the SNI hostname in the ClientHello, so the cold start is usually hidden.
5. **Bindings do not leave Cloudflare's network.** `env.DB.prepare()` is an internal RPC, not a public HTTPS call with credentials.

### 1.8 Local Development: `wrangler dev`, Miniflare and workerd

`wrangler dev` runs your bundle on **workerd**, the same open-source runtime as production, through **Miniflare**, which simulates the bindings. KV, D1, R2 and Durable Objects are backed by SQLite files under `.wrangler/state/`.

| Mode | Command | Code runs on | Bindings | Use when |
| --- | --- | --- | --- | --- |
| Local | `wrangler dev` | Local workerd | Local simulations in `.wrangler/state` | Day-to-day development, tests |
| Local with remote bindings | `"remote": true` on a binding, then `wrangler dev` | Local workerd | That one binding hits the real resource | Workers AI, or reading a real KV namespace |
| Remote | `wrangler dev --remote` | Cloudflare's network | Real resources (preview IDs where set) | Checking behaviour that only exists on the edge |
| Tests | `vitest` with `@cloudflare/vitest-plugin` | Local workerd | Isolated per-test storage | CI and TDD |

What local mode does **not** reproduce: production CPU limits, real latency between your Worker and D1's primary region, KV's cross-location propagation delay, the zone's WAF and cache rules, and some products that need Cloudflare's network. Test those on a staging environment.

Local storage commands mirror the remote ones:

```bash
npx wrangler d1 execute DB --local --command "SELECT slug, clicks FROM links"
npx wrangler kv key list --binding LINKS_CACHE --local
npx wrangler d1 execute DB --remote --command "SELECT count(*) FROM links"
```

### 1.9 Deploying, Versions and Rolling Back

Every upload creates an immutable **version**. A **deployment** says which versions serve traffic and in what proportion. `wrangler deploy` does both at once (upload, then 100% to the new version); the versions commands split them apart.

```mermaid
stateDiagram-v2
    [*] --> Uploaded: wrangler versions upload
    Uploaded --> Canary: versions deploy, new version at 10 percent
    Canary --> Live: versions deploy, new version at 100 percent
    Canary --> RolledBack: wrangler rollback
    Live --> RolledBack: wrangler rollback
    RolledBack --> [*]
```

```bash
# Upload without serving traffic, then preview it at a version-specific URL
npx wrangler versions upload --message "add file hosting"
npx wrangler versions list

# Gradual rollout: 10% of requests go to the new version
npx wrangler versions deploy <new-version-id>@10% <old-version-id>@90%

# Instant rollback to the previous deployment
npx wrangler rollback
```

Two things rollback does **not** undo: D1 schema migrations and data written by the bad version. Write migrations that the previous version can live with (add a column, backfill, then switch reads) so a code rollback is always safe. D1's Time Travel (`wrangler d1 time-travel restore`) exists for data mistakes, but it restores the whole database to a point in time.

### 1.10 Pitfalls

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| `compatibility_date` newer than the local runtime | `wrangler dev` warns that the date is not supported by the installed workerd and falls back or fails | Use a date at or before the Wrangler release you have, or upgrade Wrangler |
| Storing per-request data in a module-level variable | User A sees user B's data under load | Keep request data in function scope; use module scope only for immutable or cache data |
| Binding missing in an `env` block | `TypeError: Cannot read properties of undefined (reading 'prepare')` only in staging | Repeat bindings and vars inside every `env.<name>` block |
| Placeholder IDs left in `wrangler.jsonc` | `wrangler deploy` fails with a KV namespace or D1 database not found error | Create the resources and paste the real IDs |
| Expecting `wrangler kv key put` to hit production | Value never appears in production | Wrangler 4 writes locally by default; add `--remote` |
| Using `wrangler dev --remote` against production bindings | Local experiments modify live data | Use `preview_id` / `preview_database_id` or a staging environment |
| Free plan CPU limit | `Error 1102: Worker exceeded resource limits` on heavier requests | Profile, stream, move work to Wasm or Queues, or raise `limits.cpu_ms` on Paid |
| Rolling back code after a destructive migration | Old version throws `no such column` | Expand-and-contract migrations; never drop a column in the same release that stops using it |

### 1.11 Best Practices

- **Commit `wrangler.jsonc` and the lockfile**: the config is part of the code, and the lockfile pins the workerd version your tests run on.
- **Pin and raise `compatibility_date` deliberately**: date bumps change runtime behaviour, so they deserve their own pull request.
- **Use API tokens scoped to one account and the permissions Wrangler needs in CI**: a leaked `wrangler login` token has the power of your user.
- **Prefer Custom Domains for Workers that are the whole application**: Cloudflare manages DNS and certificates, and there is no origin to forget about.
- **Keep the global scope cheap**: heavy top-level work runs on every isolate start and counts against startup time limits.
- **Deploy with versions and gradual rollouts for anything user-facing**: rollback is instant, but only if you notice; a 10% canary limits the blast radius.
- **Turn on `observability` from day one**: you cannot `tail` a request that already failed.

### 1.12 Hands-on Exercise

Add a `GET /version` route that returns the Worker name, the runtime's user agent and the data centre code:

```json
{ "name": "learn-cloudflare", "runtime": "Cloudflare-Workers", "colo": "local" }
```

1. Write the handler with the `Handler` type from `src/router.ts`.
2. Register it in `src/index.ts` **before** the `/:slug` route and explain why the order matters.
3. Run `npm test`, then `npm run dev` and `curl http://localhost:8787/version`.
4. Deploy and check which `colo` answers you, then ask someone in another country to try.

The solution is [solutions/stage1-version.ts](solutions/stage1-version.ts), tested in [test/solutions.test.ts](test/solutions.test.ts).

[Back to top ⤴️](#-table-of-contents)

---

## 2. Stage 2: Workers Runtime APIs: Requests, Responses, Bindings and Handlers

This stage covers the APIs you use in every Worker: the handler types, the Web Standard `Request`/`Response` model and its Workers-specific edges, routing, bindings and secrets, background work, outbound requests, streaming, the Cache API, Cron Triggers, service bindings and Node.js compatibility. It assumes Stage 1. Afterwards you can build and test a routed, authenticated API Worker like the starter's.

```mermaid
flowchart TD
    Event["Incoming event"] --> T{"Event type"}
    T -->|"HTTP request"| F["fetch(request, env, ctx)"]
    T -->|"Cron Trigger"| S["scheduled(controller, env, ctx)"]
    T -->|"Queue batch"| Q["queue(batch, env, ctx)"]
    T -->|"Email Routing"| EM["email(message, env, ctx)"]
    T -->|"RPC from another Worker"| RPC["WorkerEntrypoint method"]
    F --> R["Response"]
    S --> D["Done or retried"]
    Q --> A["ack / retry per message"]
```

### 2.1 Module Workers and Handler Types

A module Worker is an ES module whose default export holds named handlers. The runtime calls the one that matches the event:

| Handler | Signature | Triggered by | Return value |
| --- | --- | --- | --- |
| `fetch` | `(request, env, ctx) => Response` | HTTP requests, service binding `fetch()` calls | The response |
| `scheduled` | `(controller, env, ctx) => void` | Cron Triggers | Ignored; a thrown error marks the run failed |
| `queue` | `(batch, env, ctx) => void` | Messages on a Queue the Worker consumes | Ignored; use `msg.ack()` / `msg.retry()` |
| `email` | `(message, env, ctx) => void` | Email Routing rules | Ignored; forward, reply or reject the message |
| `tail` | `(events, env, ctx) => void` | Tail Worker attached to another Worker | Ignored |

Two ways to write them:

```ts
// Object syntax: what the starter uses.
export default {
  async fetch(request, env, ctx) {
    return new Response('hello');
  },
} satisfies ExportedHandler<Env>;
```

```ts
// Class syntax: required for RPC methods (section 2.10); env and ctx are on `this`.
import { WorkerEntrypoint } from 'cloudflare:workers';

export default class extends WorkerEntrypoint<Env> {
  async fetch(request: Request) {
    return new Response(`hello from ${this.env.APP_NAME}`);
  }
}
```

The older Service Worker syntax (`addEventListener('fetch', ...)`) still runs but cannot export Durable Objects, Workflows or RPC entrypoints. Treat it as legacy.

### 2.2 `Request`, `Response`, `Headers` and `URL`

Workers implement the Fetch standard, so the objects are the same as in browsers, Deno and Node 18+. The differences that bite:

| Behaviour | What happens | Consequence |
| --- | --- | --- |
| Bodies are streams, readable once | A second `await request.json()` throws `TypeError: Body has already been used` | Read once into a variable, or `request.clone()` before the first read |
| Some headers are immutable | `response.headers.set()` on a `fetch()` result or `Response.redirect()` throws `TypeError: Can't modify immutable headers` | Copy: `new Response(res.body, res)` |
| `request.cf` | Object with `colo`, `country`, `city`, `asn`, `tlsVersion`, bot score (with Bot Management) and more | Use for routing and logging; it is undefined when you construct a `Request` yourself |
| `request.url` is absolute | Always includes scheme and host | Parse with `new URL(request.url)` |
| Responses can stream | `new Response(readableStream)` starts sending before the body is complete | Lower time to first byte; memory stays flat |

The helpers in [src/http.ts](src/http.ts) handle the common cases once:

```ts
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function errorResponse(status: number, message: string): Response {
  return json({ error: { status, message } }, { status });
}

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
```

| Line / API | Role | What happens at runtime |
| :--- | :--- | :--- |
| `class HttpError` | Typed failure | Handlers `throw new HttpError(409, ...)`; the router turns it into a response, so business code never builds error responses by hand |
| `new Headers(init.headers)` | Defensive copy | Accepts any `HeadersInit` (object, array or `Headers`) and lets us set the content type without mutating the caller's object |
| `errorResponse()` | One error envelope | Every error has the same JSON shape, which clients and tests depend on |
| content-type check | Input contract | Rejects form posts and text bodies with 415 before parsing |
| `try { await request.json() }` | Parse boundary | Malformed JSON becomes a 400 instead of an unhandled exception and a 500 |

`Response.json(data, init)` is also available as a static method and is fine for simple cases; the helper exists so the charset and error envelope are consistent.

### 2.3 Routing with `URLPattern`

Workers have no built-in router. You can use a framework (Hono, itty-router), or a small router on top of the standard `URLPattern` API, which is what [src/router.ts](src/router.ts) does:

```ts
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

export class Router {
  readonly #routes: Route[] = [];

  on(method: string, pathname: string, handler: Handler): this {
    this.#routes.push({ method, pattern: new URLPattern({ pathname }), handler });
    return this;
  }

  get(pathname: string, handler: Handler): this {
    return this.on('GET', pathname, handler);
  }

  async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    let pathMatched = false;

    for (const route of this.#routes) {
      const match = route.pattern.exec({ pathname: url.pathname });
      if (!match) continue;
      pathMatched = true;
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
```

| Line / API | Role | What happens at runtime |
| :--- | :--- | :--- |
| `new URLPattern({ pathname })` | Compile once | Patterns like `/api/links/:slug` are compiled when the module loads, not per request |
| `pattern.exec({ pathname })` | Match | Returns `null` or an object whose `pathname.groups` holds named parameters (`{ slug: 'cf-docs' }`) |
| `pathMatched` | 404 vs 405 | A path that exists with the wrong method gets 405, which tells API clients something different from 404 |
| `HEAD` → `GET` | HTTP semantics | The runtime strips the body for HEAD responses, so the GET handler can answer both |
| `await route.handler(...)` inside `try` | Error boundary | The `await` matters: without it, a rejected promise escapes the `try` and becomes an uncaught exception |
| `console.error(JSON.stringify(...))` | Structured log | Workers Logs indexes JSON fields, so you can filter by `path` later |

How the options compare:

| Option | Bundle cost | Strengths | Weaknesses |
| --- | --- | --- | --- |
| Hand-written `URLPattern` router | ~0 KB | No dependency; standard API; full control | You write middleware, CORS and validation yourself |
| Hono | Small | Middleware ecosystem, validators, typed RPC client, runs on many runtimes | Another abstraction to learn |
| itty-router | Very small | Minimal API | Fewer batteries |
| One `switch` on `url.pathname` | 0 KB | Fine for two or three routes | Does not scale; no params |

### 2.4 Bindings, Vars and Secrets

A **binding** is a capability attached to your Worker by configuration: a KV namespace, a D1 database, another Worker, a secret. The runtime puts it on `env`. Code never sees account IDs or API keys for Cloudflare resources, which removes a whole class of credential leaks and makes the Worker testable with fake bindings.

| Kind | Declared in | Visible in dashboard | Typed by `wrangler types` | Example |
| --- | --- | --- | --- | --- |
| Var | `vars` in `wrangler.jsonc` | Yes, in plain text | Yes, as a literal type | `APP_NAME`, `CACHE_TTL_SECONDS` |
| Secret | `wrangler secret put NAME` (or Secrets Store) | Name only | Only if listed in `.dev.vars` when you run it | `ADMIN_TOKEN` |
| Resource | `kv_namespaces`, `d1_databases`, `r2_buckets`, ... | Yes | Yes | `env.DB: D1Database` |
| Service | `services` | Yes | Yes | `env.AUTH: Fetcher` or an RPC stub |

```bash
# Production secret, encrypted at rest, never shown again
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret list

# Local secrets for wrangler dev live in .dev.vars (gitignored)
echo 'ADMIN_TOKEN=change-me-local-only' > .dev.vars
```

The generated `worker-configuration.d.ts` starts with your bindings:

```ts
interface __BaseEnv_Env {
  LINKS_CACHE: KVNamespace;
  FILES: R2Bucket;
  DB: D1Database;
  APP_NAME: 'learn-cloudflare';
  CACHE_TTL_SECONDS: '3600';
}
```

Two details in that output: vars are typed as string **literals** (so `Number(env.CACHE_TTL_SECONDS)` is needed for arithmetic), and the secret is missing because no `.dev.vars` existed when the file was generated. The starter declares secrets in [src/secrets.d.ts](src/secrets.d.ts) so CI does not depend on a local file:

```ts
interface Env {
  ADMIN_TOKEN: string;
}

declare namespace Cloudflare {
  interface Env {
    ADMIN_TOKEN: string;
  }
}
```

Secrets need careful comparison too. [src/auth.ts](src/auth.ts) hashes both values so they have equal length, then uses the Workers-specific `crypto.subtle.timingSafeEqual`:

```ts
const encoder = new TextEncoder();

export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

export async function requireAdmin(request: Request, env: Env): Promise<void> {
  if (!env.ADMIN_TOKEN) throw new HttpError(401, 'Admin token is not configured');

  const header = request.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || !(await safeEqual(token, env.ADMIN_TOKEN))) {
    throw new HttpError(401, 'Missing or invalid bearer token');
  }
}
```

The `if (!env.ADMIN_TOKEN)` line is the important one: if someone forgets `wrangler secret put`, the API **fails closed** instead of comparing against an empty string.

### 2.5 `ExecutionContext`: `waitUntil` and `passThroughOnException`

The third handler argument controls the invocation's lifetime:

| Method | Effect | Typical use |
| --- | --- | --- |
| `ctx.waitUntil(promise)` | Keeps the invocation alive after the response until the promise settles (bounded by a time limit after the response) | Analytics writes, cache fills, click counters, log shipping |
| `ctx.passThroughOnException()` | If the Worker throws, Cloudflare forwards the request to the origin as if the Worker were absent | Fail-open Workers on a route in front of an existing site |
| `ctx.props` | Data passed in by the caller of a service binding or entrypoint | Per-caller configuration in RPC (section 2.10) |

The starter's redirect is the canonical `waitUntil` case ([src/links.ts](src/links.ts)):

```ts
export const redirect: Handler = async (_request, env, ctx, params) => {
  const slug = params.slug ?? '';
  const link = await findLink(env, slug);
  if (!link) return errorResponse(404, `No link named "${slug}"`);

  ctx.waitUntil(
    env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE slug = ?1').bind(slug).run(),
  );
  return Response.redirect(link.url, 302);
};
```

```mermaid
sequenceDiagram
    participant U as Browser
    participant W as Worker
    participant KV as KV
    participant D1 as D1 primary
    U->>W: GET /cf-docs
    W->>KV: get link:cf-docs
    KV-->>W: url
    W-->>U: 302 Location (response sent)
    W->>D1: UPDATE clicks (inside waitUntil)
    D1-->>W: ok
    Note over W: invocation ends when the waitUntil promise settles
```

The user's redirect does not wait for a write to a database that may be on another continent. The trade-off: if the D1 write fails, the user never knows and nothing retries it. For counts that must be exact, send the event to a Queue instead (Stage 4).

Do not fire and forget without `waitUntil`. A promise that is still pending when the response is returned may be cancelled when the runtime decides the request is finished.

### 2.6 Subrequests with `fetch()`

Any `fetch()` from a Worker is a **subrequest**. It leaves from the same data centre, and if it targets a Cloudflare zone it passes through that zone's cache and rules.

```ts
interface Repo {
  stargazers_count: number;
}

export async function repoStars(owner: string, repo: string): Promise<number> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'user-agent': 'learn-cloudflare-example', accept: 'application/vnd.github+json' },
    // Cloudflare-specific: cache this subrequest at the edge for 5 minutes, even without cache headers.
    cf: { cacheTtl: 300, cacheEverything: true },
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
  const data = await response.json<Repo>();
  return data.stargazers_count;
}
```

| Option | Effect |
| --- | --- |
| `cf.cacheTtl` | Override the edge cache TTL for this subrequest |
| `cf.cacheEverything` | Cache responses that Cloudflare would not cache by default, such as HTML |
| `cf.cacheKey` | Custom cache key (Enterprise) |
| `cf.image` | Image Resizing options when fetching an image through a zone with it enabled |
| `signal: AbortSignal.timeout(ms)` | A deadline; without it a slow upstream holds the invocation until the wall-clock limit |

Limits to design around: a cap on subrequests per invocation (50 on Free and 1,000 on Paid at time of writing; check the limits page), a cap on simultaneous open connections per invocation (six), and the fact that `fetch()` to your own Worker's hostname from inside that Worker is blocked as a loop; use a service binding for Worker-to-Worker calls.

### 2.7 Streams and `HTMLRewriter`

Bodies are `ReadableStream`s. Streaming keeps memory under the 128 MB isolate limit and lowers time to first byte. A `TransformStream` lets you change data as it flows:

```ts
export default {
  async fetch(request) {
    const upstream = await fetch('https://example.com/large.ndjson');
    if (!upstream.body) return new Response('no body', { status: 502 });

    // Uppercase the body as it streams through, without buffering it.
    const upper = new TransformStream<string, string>({
      transform(chunk, controller) {
        controller.enqueue(chunk.toUpperCase());
      },
    });

    const body = upstream.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(upper)
      .pipeThrough(new TextEncoderStream());

    return new Response(body, { headers: { 'content-type': 'application/x-ndjson' } });
  },
} satisfies ExportedHandler;
```

For HTML there is `HTMLRewriter`, a streaming parser with CSS selectors that edits pages on the way through. It never builds a DOM, so it works on pages of any size:

```ts
export default {
  async fetch(request) {
    const page = await fetch(request); // pass through to the origin on a route
    const country = request.cf?.country ?? 'unknown';

    return new HTMLRewriter()
      .on('a[href^="http://"]', {
        element(el) {
          el.setAttribute('href', el.getAttribute('href')!.replace('http://', 'https://'));
        },
      })
      .on('body', {
        element(el) {
          el.prepend(`<div class="banner">Shipping to ${country}</div>`, { html: true });
        },
      })
      .transform(page);
  },
} satisfies ExportedHandler;
```

`request.cf.country` is attacker-influenced only through their network location, but anything you insert with `{ html: true }` must still be escaped if it can contain user input.

### 2.8 The Cache API vs the CDN Cache

There are two caches and they are easy to confuse:

| | CDN cache (Cache Rules, `cf` on `fetch`) | Cache API (`caches.default`) |
| --- | --- | --- |
| Who fills it | Cloudflare, for subrequests and proxied origin responses | Your code, explicitly with `cache.put()` |
| Scope | Per data centre (tiered cache can add an upper tier) | Per data centre only |
| Purge | Dashboard or API purge by URL, tag, host, prefix | `cache.delete()` in each data centre; API purge by URL also works |
| Works on `*.workers.dev` | No zone cache rules there | `put` has no effect on `workers.dev`; use a custom domain |
| Good for | Origin responses, assets | Responses your Worker computed, such as rendered pages or API aggregates |

A read-through Cache API wrapper:

```ts
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET') return new Response('method not allowed', { status: 405 });

    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;

    const body = JSON.stringify({ generatedAt: new Date().toISOString() });
    const response = new Response(body, {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
    });
    // Store a copy after responding; the cache honours Cache-Control max-age.
    ctx.waitUntil(cache.put(request, response.clone()));
    return response;
  },
} satisfies ExportedHandler;
```

Neither cache is global. A request in Frankfurt does not warm Singapore. For data that must be the same everywhere, use KV or D1 (Stage 3).

### 2.9 Scheduled Handlers and Cron Triggers

Cron Triggers run your `scheduled` handler on a schedule declared in configuration (UTC, standard five-field cron syntax plus a few extensions). The starter purges expired links daily:

```jsonc
"triggers": { "crons": ["0 3 * * *"] }
```

```ts
export async function purgeExpired(env: Env): Promise<number> {
  const result = await env.DB.prepare(
    'DELETE FROM links WHERE expires_at IS NOT NULL AND expires_at <= ?1',
  )
    .bind(nowSeconds())
    .run();
  return result.meta.changes;
}
```

Test cron logic locally without waiting:

```bash
npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=0+3+*+*+*"
```

In unit tests the Vitest plugin builds a controller for you (from [test/worker.test.ts](test/worker.test.ts)):

```ts
const ctx = createExecutionContext();
await worker.scheduled(createScheduledController({ cron: '0 3 * * *' }), env, ctx);
await waitOnExecutionContext(ctx);
```

Cron runs happen in one location, not everywhere, and may be delayed slightly or, rarely, run twice. Make scheduled work idempotent: "delete rows older than X" is safe to repeat; "send the daily email" needs a record of what was sent.

### 2.10 Service Bindings and RPC

A **service binding** connects one Worker to another without a public URL. The call stays inside the runtime (often on the same machine and thread), adds no network hop, and costs no extra request on the callee's side.

```mermaid
flowchart LR
    Client["Browser"] --> GW["gateway Worker"]
    GW -->|"env.AUTH.verify(token)"| AUTH["auth Worker (WorkerEntrypoint)"]
    GW -->|"env.LINKS.fetch(request)"| LINKS["links Worker"]
    AUTH --> KV[("KV: sessions")]
    LINKS --> D1[("D1")]
```

The callee exposes methods by extending `WorkerEntrypoint`:

```ts
// auth-worker/src/index.ts
import { WorkerEntrypoint } from 'cloudflare:workers';

export interface Session {
  userId: string;
  roles: string[];
}

export default class AuthService extends WorkerEntrypoint<Env> {
  // Public RPC method: callable as env.AUTH.verify(token) from a bound Worker.
  async verify(token: string): Promise<Session | null> {
    return this.env.SESSIONS.get<Session>(`session:${token}`, 'json');
  }

  // A Worker with only RPC callers can still answer HTTP.
  async fetch() {
    return new Response('auth service', { status: 404 });
  }
}
```

```jsonc
// gateway/wrangler.jsonc
{
  "services": [{ "binding": "AUTH", "service": "auth-worker" }]
}
```

```ts
// gateway/src/index.ts
export default {
  async fetch(request, env) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
    const session = await env.AUTH.verify(token); // typed RPC, no JSON, no URL
    if (!session) return new Response('unauthorized', { status: 401 });
    return new Response(`hello ${session.userId}`);
  },
} satisfies ExportedHandler<Env>;
```

RPC arguments and return values use the structured clone algorithm plus Workers extensions: you can pass objects, `Date`, `Map`, `ReadableStream`, `Request`/`Response`, and even functions and class instances with methods (as stubs). Run `wrangler types` in the gateway to get the callee's method types, or share an interface package.

| Option | Latency | Auth model | Typing |
| --- | --- | --- | --- |
| Service binding RPC | In-process, no network | Only bound Workers can call | Method signatures |
| Service binding `fetch()` | In-process | Same | HTTP contract |
| Public HTTPS between Workers | Full network path | You add tokens or mTLS | HTTP contract |

### 2.11 Node.js Compatibility

Workers are not Node.js, but with the `nodejs_compat` flag the runtime provides a large subset of Node's built-in modules, implemented natively or polyfilled at build time:

```jsonc
{ "compatibility_flags": ["nodejs_compat"], "compatibility_date": "2026-07-01" }
```

```ts
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

const requestId = new AsyncLocalStorage<string>();

export default {
  async fetch(request) {
    return requestId.run(crypto.randomUUID(), async () => {
      const digest = createHash('sha256').update(Buffer.from(request.url)).digest('hex');
      return Response.json({ id: requestId.getStore(), digest });
    });
  },
} satisfies ExportedHandler;
```

| Works well | Partial or emulated | Not available |
| --- | --- | --- |
| `buffer`, `crypto`, `events`, `stream`, `util`, `url`, `path`, `async_hooks` (`AsyncLocalStorage`), `string_decoder`, `zlib` | `fs` (in-memory, per request), `net` (via `cloudflare:sockets` TCP), `http`/`https` client APIs, `process.env` (populated from string bindings on recent dates) | `child_process`, `cluster`, native add-ons (`.node` files), `worker_threads` |

Prefer Web APIs when both exist (`crypto.subtle` over `node:crypto`, `fetch` over `http.request`): they are native in every runtime, smaller in bundles and less likely to hit an emulated path.

### 2.12 Errors, Logging and Observability Basics

Uncaught exceptions return Cloudflare's error 1101 page to the user. Catch at one boundary (the router), log a structured record, and return your own envelope. With `observability.enabled`, every `console.log` line goes to Workers Logs, where JSON fields are queryable:

```ts
function log(level: 'info' | 'error', msg: string, fields: Record<string, unknown> = {}) {
  // One JSON object per line: Workers Logs parses and indexes the fields.
  console[level](JSON.stringify({ level, msg, ...fields }));
}

export default {
  async fetch(request) {
    const started = Date.now();
    try {
      return new Response('ok');
    } finally {
      log('info', 'request', {
        method: request.method,
        path: new URL(request.url).pathname,
        colo: request.cf?.colo,
        ms: Date.now() - started,
      });
    }
  },
} satisfies ExportedHandler;
```

`Date.now()` does not advance during synchronous CPU work inside a request (a timing side-channel mitigation); it updates after I/O. Use it to measure I/O latency, not CPU loops. Live debugging uses `npx wrangler tail --format pretty`; Stage 6 covers traces, metrics and alerting.

### 2.13 Pitfalls

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| Reading a body twice | `TypeError: Body has already been used. It can only be used once.` | Read once into a variable or `clone()` first |
| Mutating headers of a fetched response | `TypeError: Can't modify immutable headers.` | `const res = new Response(upstream.body, upstream)` then modify |
| Forgetting `await` inside `try` | Rejections bypass your handler; user sees error 1101 | `return await handler(...)` inside the `try` |
| Background promise without `waitUntil` | Writes randomly missing in production, fine locally | Wrap in `ctx.waitUntil()` or move to a Queue |
| Using vars as numbers | `"3600" * 2` works but `"3600" + 60` gives `"360060"` | Convert with `Number()` and validate once |
| Secret not set in production | Every authenticated call returns 401, or worse, auth is skipped | Fail closed on empty secrets; check `wrangler secret list` in the deploy pipeline |
| Calling your own hostname with `fetch()` | Request loops or is rejected | Use a service binding, or call the handler function directly |
| Expecting Cache API to work on `workers.dev` | `cache.match()` always misses | Use a custom domain or route |
| Treating cron as exactly-once | Duplicate emails or charges | Idempotency keys or a "done" record per run |

### 2.14 Best Practices

- **Return errors as values at one boundary**: `HttpError` plus a single `catch` gives consistent responses and one place to log.
- **Type the environment from configuration**: run `wrangler types` and check it in CI with `--check` so `env` cannot drift from `wrangler.jsonc`.
- **Fail closed on missing secrets**: an empty secret should disable the feature, never bypass it.
- **Put deadlines on every subrequest**: `AbortSignal.timeout()` keeps a slow dependency from consuming your wall-clock budget.
- **Stream large bodies**: pipe requests to R2 and responses from upstream instead of `await res.arrayBuffer()`.
- **Use service binding RPC between your own Workers**: no public endpoint, no shared secret, typed calls.
- **Prefer Web APIs over `node:` modules when both exist**: native, portable and smaller.
- **Log JSON, one object per line**: Workers Logs can filter and aggregate fields; free-form strings cannot be queried.

### 2.15 Hands-on Exercise

Write a `withCors(handler, allowedOrigins)` wrapper that:

1. Answers `OPTIONS` preflights from an allowed origin with `204`, `access-control-allow-origin`, allowed methods and headers, and `access-control-max-age: 86400`, without calling the wrapped handler.
2. Rejects preflights from other origins with `403`.
3. Adds `access-control-allow-origin` and `vary: Origin` to normal responses for allowed origins, even when the wrapped handler returns an immutable `Response.redirect()`.
4. Leaves responses for other origins untouched.

Expected behaviour, as a test:

```ts
const handler = withCors(() => json({ ok: true }), ['https://app.example']);
const preflight = new Request('https://sho.rt/api/links', {
  method: 'OPTIONS',
  headers: { origin: 'https://app.example' },
});
const res = await handler(preflight, env, createExecutionContext(), {});
// res.status === 204, res.headers.get('access-control-allow-origin') === 'https://app.example'
```

The solution is [solutions/stage2-cors.ts](solutions/stage2-cors.ts), tested in [test/solutions.test.ts](test/solutions.test.ts).

[Back to top ⤴️](#-table-of-contents)

---

## 3. Stage 3: Storage at the Edge: KV, D1, R2 and Hyperdrive

Compute everywhere is only useful if data is reachable from everywhere. This stage explains the consistency model, limits and API of each storage product, then walks through how the starter combines them: D1 as the source of truth for links, KV as a global read cache in front of it, and R2 for uploaded files. It assumes Stage 2's bindings. Afterwards you can choose a store for a new feature, write and migrate a D1 schema, and test storage code without touching production.

```mermaid
flowchart LR
    W["Worker"] -->|"env.LINKS_CACHE"| KV[("KV: global cache, eventual")]
    W -->|"env.DB"| D1[("D1: SQLite, strong at primary")]
    W -->|"env.FILES"| R2[("R2: objects, strong")]
    W -->|"env.HYPERDRIVE"| HD["Hyperdrive pool"] --> PG[("Existing PostgreSQL")]
    W -->|"stub.method()"| DO["Durable Object: Stage 4"]
```

### 3.1 Choosing a Data Store

| Store | Data model | Consistency | Latency profile | Limits that shape design (at time of writing) | Pick it for |
| --- | --- | --- | --- | --- | --- |
| KV | Key → value (up to 25 MiB) with metadata | Eventual; a write can take 60 s or more to be visible everywhere | Hot keys are cached in each location; cold reads go to central storage | 1 write per second per key | Config, feature flags, cached lookups, session-ish data that tolerates staleness |
| D1 | SQLite database | Strong at the primary; replicas with the Sessions API give read-your-writes | Writes go to one primary location | 10 GB per database on Paid; one writer per database | Relational data, per-tenant databases, anything you would query with SQL |
| R2 | Objects up to 5 TiB with HTTP metadata | Strong read-after-write, including listings | Similar to S3; no egress fees | Single `put` up to about 5 GiB; multipart beyond | Files, media, backups, data lake objects |
| Durable Objects | Single-threaded object with private SQLite or KV storage | Strong, serialised per object | Lives in one location near its first user | One object handles about a thousand requests per second | Counters, rate limits, rooms, locks, per-entity state |
| Hyperdrive | Your existing PostgreSQL or MySQL | Whatever the database gives | Pooled connections and cached reads near the database | Your database's limits | Migrating an existing app without moving the data |

```mermaid
flowchart TD
    Q1{"Is it a file or blob?"} -->|"yes"| R2["R2"]
    Q1 -->|"no"| Q2{"Do you need SQL, joins or transactions?"}
    Q2 -->|"yes, new data"| D1["D1"]
    Q2 -->|"yes, existing database"| HD["Hyperdrive"]
    Q2 -->|"no"| Q3{"Must every reader see the latest write immediately?"}
    Q3 -->|"yes, per entity"| DO["Durable Object"]
    Q3 -->|"no, read-heavy, staleness ok"| KV["KV"]
```

### 3.2 Workers KV: Model and Consistency

KV stores values in a small number of central locations and caches them in every data centre that reads them. A read in a location that has the key cached is fast; a read in a location that has not seen it recently goes to central storage. A write lands centrally and **other locations keep serving their cached copy until it expires**, which is the source of KV's eventual consistency.

```mermaid
sequenceDiagram
    participant A as Worker in Mumbai
    participant C as KV central storage
    participant B as Worker in London
    A->>C: put flag = on
    C-->>A: ok
    B->>B: get flag, served from the London cache = off
    Note over B: stale until the cached copy expires (cacheTtl)
    B->>C: get flag after expiry
    C-->>B: on
```

Rules that follow from this design:

| Rule | Reason |
| --- | --- |
| Do not use KV for counters or anything read-modify-write | Two locations reading and writing the same key lose updates; use a Durable Object or D1 |
| Keep writes to a key at most once per second | KV rejects faster writes to the same key with a 429 error |
| Do not depend on reading back your own write | Return the value you just wrote instead of reading it again |
| Large values are fine, many tiny keys are fine | Values up to 25 MiB; keys up to 512 bytes; metadata up to 1 KB |
| `cacheTtl` on `get()` trades freshness for speed | A longer TTL means fewer central reads and staler data |

### 3.3 The KV API and the Starter's Read-Through Cache

```ts
// Reads: type selects decoding; cacheTtl (seconds) controls edge caching of this key.
const text = await env.LINKS_CACHE.get('greeting');                      // string | null
const obj = await env.LINKS_CACHE.get<{ url: string }>('link:x', 'json'); // parsed JSON
const bytes = await env.LINKS_CACHE.get('blob', 'arrayBuffer');
const stream = await env.LINKS_CACHE.get('big', 'stream');
const tuned = await env.LINKS_CACHE.get('config', { type: 'json', cacheTtl: 300 });
const { value, metadata } = await env.LINKS_CACHE.getWithMetadata<{ v: number }>('config', 'json');

// Writes: absolute (epoch seconds) or relative expiry, minimum 60 seconds.
await env.LINKS_CACHE.put('session:abc', JSON.stringify({ userId: 'u1' }), { expirationTtl: 3600 });
await env.LINKS_CACHE.put('config', '{}', { metadata: { v: 2 } });
await env.LINKS_CACHE.delete('session:abc');
```

The starter's `findLink()` in [src/links.ts](src/links.ts) puts KV in front of D1:

```ts
export async function findLink(env: Env, slug: string): Promise<CachedLink | null> {
  const cached = await env.LINKS_CACHE.get<CachedLink>(cacheKey(slug), 'json');
  if (cached) return isExpired(cached.expiresAt) ? null : cached;

  const row = await env.DB.prepare('SELECT url, expires_at FROM links WHERE slug = ?1')
    .bind(slug)
    .first<Pick<LinkRow, 'url' | 'expires_at'>>();
  if (!row || isExpired(row.expires_at)) return null;

  const value: CachedLink = { url: row.url, expiresAt: row.expires_at };
  const ttl = Math.max(60, Number(env.CACHE_TTL_SECONDS) || 3600);
  await env.LINKS_CACHE.put(cacheKey(slug), JSON.stringify(value), { expirationTtl: ttl });
  return value;
}
```

| Line / API | Role | What happens at runtime |
| :--- | :--- | :--- |
| `get<CachedLink>(key, 'json')` | Cache lookup | One KV read; on a hot key it is answered from the local data centre |
| `isExpired(cached.expiresAt)` | Correctness on stale data | The cached entry carries the link's own expiry, so an expired link is refused even if KV still has it |
| `.first<...>()` | Fallback to source of truth | Returns the first row or `null`; one round trip to D1 |
| `Math.max(60, ...)` | Respect KV's minimum | `expirationTtl` below 60 seconds is rejected |
| `put(..., { expirationTtl })` | Fill the cache | Bounds how long a deleted or changed link can keep redirecting in other locations |

`deleteLink()` deletes the D1 row and then the KV key. In the location that served the delete, the next read misses; in other locations the old entry can survive until its cached copy expires. For a link shortener that is acceptable. For something like revoking access, it is not; Stage 4 shows a Durable Object alternative.

### 3.4 KV Patterns: Metadata, Listing and Expiry

**Listing** is paginated and returns keys (and metadata), not values:

```ts
export async function allKeys(kv: KVNamespace, prefix: string): Promise<string[]> {
  const names: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, cursor, limit: 1000 });
    names.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return names;
}
```

**Metadata** is returned by `list()`, so small facts you need while listing belong there instead of in the value:

```ts
await env.LINKS_CACHE.put(`user:${id}`, JSON.stringify(profile), {
  metadata: { plan: profile.plan, updatedAt: Date.now() },
});
const page = await env.LINKS_CACHE.list<{ plan: string }>({ prefix: 'user:' });
const proUsers = page.keys.filter((k) => k.metadata?.plan === 'pro');
```

**Bulk changes** from outside the Worker use Wrangler or the REST API:

```bash
# bulk.json: [{"key":"flag:beta","value":"on"},{"key":"flag:dark","value":"off","expiration_ttl":86400}]
npx wrangler kv bulk put bulk.json --binding LINKS_CACHE --remote
npx wrangler kv key get flag:beta --binding LINKS_CACHE --remote
```

Key design: use a prefix per entity type (`link:`, `user:`, `flag:`), keep keys short and deterministic, and never put secrets or personal data in key names, because keys appear in listings and dashboards.

### 3.5 D1: SQLite as a Service

Each D1 database is a SQLite database managed by Cloudflare. The primary copy lives in one location (chosen near the first request or set with `--location`), and every write goes there. Because SQLite has one writer, **a database's write throughput is set by how long your queries take**: 1 ms queries allow roughly a thousand per second, 100 ms queries roughly ten. That makes indexing and query shape a capacity concern, not only a latency one.

```mermaid
flowchart LR
    W1["Worker in Sydney"] --> P[("D1 primary, e.g. WEUR")]
    W2["Worker in Paris"] --> P
    W3["Worker in Sao Paulo"] --> P
    P -.->|"async replication"| R1[("Replica APAC")]
    P -.->|"async replication"| R2[("Replica ENAM")]
    W1 -.->|"withSession reads"| R1
```

| Fact | Consequence |
| --- | --- |
| SQLite dialect | `unixepoch()`, `RETURNING`, JSON functions (`json_extract`), FTS5 and partial indexes work |
| 10 GB per database (Paid), many databases per account | Prefer one database per tenant or per bounded context over one huge database |
| No `BEGIN`/`COMMIT` from your code | Use `batch()`, which runs statements as one transaction |
| Up to 100 bound parameters per statement | Chunk large `IN (...)` lists or use `json_each()` |
| Time Travel point-in-time restore | `wrangler d1 time-travel restore DB --timestamp=...` restores the whole database |

```bash
npx wrangler d1 create learn-cloudflare-links --location=weur
npx wrangler d1 execute DB --remote --command "PRAGMA table_list"
npx wrangler d1 export DB --remote --output=backup.sql
```

### 3.6 Querying D1: `prepare`, `bind`, `first`, `all`, `run`, `batch`

| Method | Returns | Use for |
| --- | --- | --- |
| `prepare(sql)` | `D1PreparedStatement` | Every query; parameters go through `bind()`, never string concatenation |
| `.bind(...values)` | Same statement with values | `?1`, `?2` (numbered) or `?` placeholders |
| `.first<T>()` | First row or `null` | Lookups by key; `first('col')` returns one column |
| `.all<T>()` | `{ results: T[], meta }` | Lists |
| `.run()` | `{ success, meta: { changes, last_row_id, rows_read, rows_written, duration } }` | Writes |
| `.raw()` | Arrays instead of objects | Large result sets, fewer allocations |
| `db.batch([...])` | One result per statement | Several statements in one round trip and one transaction |

The starter's create handler shows two techniques: `INSERT ... ON CONFLICT DO NOTHING RETURNING` to detect a taken slug without a race, and `meta.changes` to detect a missing row on delete:

```ts
const created = await env.DB.prepare(
  `INSERT INTO links (slug, url, expires_at) VALUES (?1, ?2, ?3)
   ON CONFLICT (slug) DO NOTHING
   RETURNING slug, url, clicks, created_at, expires_at`,
)
  .bind(slug, input.url, expiresAt)
  .first<LinkRow>();
if (!created) throw new HttpError(409, `Slug "${slug}" is already taken`);
```

```ts
const result = await env.DB.prepare('DELETE FROM links WHERE slug = ?1').bind(slug).run();
if (result.meta.changes === 0) throw new HttpError(404, `No link named "${slug}"`);
```

| Approach | Round trips | Race-free | Notes |
| --- | --- | --- | --- |
| `SELECT` then `INSERT` | 2 | No: two requests can both see "free" | The classic bug |
| `INSERT` and catch `UNIQUE constraint failed` | 1 | Yes | Works, but you parse error strings |
| `INSERT ... ON CONFLICT DO NOTHING RETURNING` | 1 | Yes | Row or `null`; the starter's choice |

`batch()` for atomic multi-statement work, for example moving clicks into a daily rollup:

```ts
export async function rollupClicks(db: D1Database, day: string) {
  const [insert, reset] = await db.batch([
    db.prepare(
      `INSERT INTO daily_clicks (day, slug, clicks)
       SELECT ?1, slug, clicks FROM links WHERE clicks > 0`,
    ).bind(day),
    db.prepare('UPDATE links SET clicks = 0 WHERE clicks > 0'),
  ]);
  // Both statements committed together, or neither did.
  return { rows: insert?.meta.changes ?? 0, reset: reset?.meta.changes ?? 0 };
}
```

### 3.7 D1 Migrations and Schema Evolution

Migrations are numbered SQL files applied in order and recorded in a `d1_migrations` table:

```bash
npx wrangler d1 migrations create DB add_owner_column   # writes migrations/0002_add_owner_column.sql
npx wrangler d1 migrations list DB --local
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote             # production, run before wrangler deploy
```

The starter's first migration, [migrations/0001_create_links.sql](migrations/0001_create_links.sql):

```sql
CREATE TABLE links (
  slug       TEXT PRIMARY KEY,
  url        TEXT NOT NULL,
  clicks     INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER
);

CREATE INDEX idx_links_expires_at ON links (expires_at) WHERE expires_at IS NOT NULL;
```

| Line | Why |
| --- | --- |
| `slug TEXT PRIMARY KEY` | The lookup key is the primary key, so `WHERE slug = ?` is a B-tree seek |
| `INTEGER` timestamps with `unixepoch()` | Compact, comparable, timezone-free; the API converts to ISO strings |
| Partial index on `expires_at` | The cron's `DELETE ... WHERE expires_at <= ?` scans only links that can expire |

During a deploy, old and new code run side by side (gradual deployments make that explicit), so schema changes follow **expand and contract**:

```mermaid
flowchart LR
    A["1. Expand: ADD COLUMN owner TEXT"] --> B["2. Deploy code that writes owner and tolerates NULL"]
    B --> C["3. Backfill in batches"]
    C --> D["4. Deploy code that requires owner"]
    D --> E["5. Contract: drop old columns or constraints"]
```

```sql
-- migrations/0002_add_owner_column.sql (expand: safe for the old code)
ALTER TABLE links ADD COLUMN owner TEXT;
CREATE INDEX idx_links_owner ON links (owner);
```

SQLite's `ALTER TABLE` is limited: it can add and rename columns, and drop columns that are not indexed or constrained, but changing a column's type or constraints means creating a new table, copying rows and renaming, which on a large table must be done in batches to avoid long-running writes.

### 3.8 D1 Read Replication and the Sessions API

With read replication enabled on a database, D1 keeps read-only replicas in several regions. Queries made through a **session** may be served by a replica, and the session's **bookmark** guarantees each query sees at least the state of the previous one, so a user always reads their own writes.

```mermaid
sequenceDiagram
    participant C as Client
    participant W as Worker
    participant R as Nearby replica
    participant P as Primary
    C->>W: POST /api/links (no bookmark)
    W->>P: INSERT (session "first-primary")
    P-->>W: ok + bookmark b42
    W-->>C: 201 + x-d1-bookmark: b42
    C->>W: GET /api/links/x (x-d1-bookmark: b42)
    W->>R: SELECT (session from b42)
    Note over R: waits until it has applied b42, or the query goes to the primary
    R-->>W: row
    W-->>C: 200 + new bookmark
```

```ts
export default {
  async fetch(request, env) {
    // Reads may go to any replica unless the client sends a bookmark from an earlier write.
    const bookmark = request.headers.get('x-d1-bookmark') ?? 'first-unconstrained';
    const session = env.DB.withSession(bookmark);

    const row = await session.prepare('SELECT slug, clicks FROM links WHERE slug = ?1').bind('cf-docs').first();

    const response = Response.json(row);
    response.headers.set('x-d1-bookmark', session.getBookmark() ?? '');
    return response;
  },
} satisfies ExportedHandler<Env>;
```

| Session start | Meaning |
| --- | --- |
| `'first-unconstrained'` | First query may hit any replica; fastest; fine for anonymous reads |
| `'first-primary'` | First query goes to the primary; use when the request writes or must see the latest data |
| A bookmark string | Continue from the point a previous request reached |

Without `withSession()`, queries go to the primary exactly as before, so enabling replication does not change existing code until you opt in.

### 3.9 R2: Object Storage Without Egress Fees

R2 speaks two APIs: the Workers binding (no credentials, used here) and an S3-compatible HTTP API (for existing tools, SDKs and presigned URLs). It charges for storage and operations but not for bandwidth out, which changes the economics of serving media and datasets.

The starter's upload and download handlers, [src/files.ts](src/files.ts):

```ts
export const putFile: Handler = async (request, env, _ctx, params) => {
  await requireAdmin(request, env);
  const key = keyFrom(params);
  const length = Number(request.headers.get('content-length'));
  if (!length) throw new HttpError(411, 'Content-Length is required');
  if (length > MAX_UPLOAD_BYTES) throw new HttpError(413, 'File is larger than 10 MiB');

  const object = await env.FILES.put(key, request.body, {
    httpMetadata: { contentType: request.headers.get('content-type') ?? 'application/octet-stream' },
  });
  return json({ key: object.key, size: object.size, etag: object.httpEtag }, { status: 201 });
};

export const getFile: Handler = async (request, env, _ctx, params) => {
  const key = keyFrom(params);
  const object = await env.FILES.get(key, { onlyIf: request.headers });
  if (object === null) return errorResponse(404, `No file named "${key}"`);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=300');

  if (!('body' in object)) return new Response(null, { status: 304, headers });
  return new Response(object.body, { headers });
};
```

| Line / API | Role | What happens at runtime |
| :--- | :--- | :--- |
| `content-length` check | Required by streaming `put` | R2 needs to know a stream's length up front; a body without it fails, so the API asks for it with 411 |
| `put(key, request.body, ...)` | Streaming upload | Bytes flow from the client to R2 without being held in the isolate's memory |
| `httpMetadata.contentType` | Stored HTTP headers | Saved with the object and replayed by `writeHttpMetadata()` on download |
| `object.httpEtag` | Quoted ETag | Use `httpEtag` (with quotes) in headers; `etag` is the bare value |
| `get(key, { onlyIf: request.headers })` | Conditional GET inside R2 | R2 evaluates `If-None-Match` and `If-Modified-Since`; on a match it returns metadata without a body |
| `'body' in object` | Distinguish result types | `R2ObjectBody` has `body`; a bare `R2Object` means the precondition failed, so answer 304 |
| `cache-control` | Edge and browser caching | On a custom domain, Cloudflare's cache can serve repeat downloads without invoking R2 |

### 3.10 R2 Patterns: Ranges, Listing, Multipart and Presigned URLs

**Range requests** (video seeking, resumable downloads):

```ts
const object = await env.FILES.get(key, { range: request.headers }); // honours the Range header
if (object && 'body' in object && object.range) {
  // R2Range is { offset, length? }, { offset?, length } or { suffix } for "bytes=-500".
  const r = object.range as { offset?: number; length?: number; suffix?: number };
  const offset = r.suffix !== undefined ? object.size - r.suffix : (r.offset ?? 0);
  const length = r.suffix ?? r.length ?? object.size - offset;
  const headers = new Headers({ 'content-range': `bytes ${offset}-${offset + length - 1}/${object.size}` });
  object.writeHttpMetadata(headers);
  return new Response(object.body, { status: 206, headers });
}
```

**Listing with a delimiter** treats `/` as folders:

```ts
const listing = await env.FILES.list({ prefix: 'reports/2026/', delimiter: '/', limit: 100 });
// listing.objects: files directly under the prefix
// listing.delimitedPrefixes: "subfolders" such as reports/2026/11/
// listing.truncated + listing.cursor: paginate
```

**Multipart uploads** for files beyond a single `put`, or to upload in parallel and resume:

```ts
export async function uploadInParts(bucket: R2Bucket, key: string, parts: ReadableStream[]) {
  const upload = await bucket.createMultipartUpload(key);
  try {
    // Every part except the last must be at least 5 MiB.
    const uploaded = await Promise.all(parts.map((body, i) => upload.uploadPart(i + 1, body)));
    return await upload.complete(uploaded);
  } catch (err) {
    await upload.abort(); // otherwise incomplete parts keep costing storage
    throw err;
  }
}
```

**Presigned URLs** let a browser upload directly to R2, so large files never pass through your Worker. They use the S3 API with an R2 access key, signed here with the small `aws4fetch` library:

```ts
import { AwsClient } from 'aws4fetch';

interface PresignEnv {
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  ACCOUNT_ID: string;
}

export async function presignPut(env: PresignEnv, bucket: string, key: string): Promise<string> {
  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  });
  const url = new URL(`https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${key}`);
  url.searchParams.set('X-Amz-Expires', '600'); // valid for 10 minutes
  const signed = await client.sign(new Request(url, { method: 'PUT' }), { aws: { signQuery: true } });
  return signed.url;
}
```

| Upload path | Worker CPU and memory | Auth check | Size ceiling |
| --- | --- | --- | --- |
| Through the Worker (starter) | Streams through; small | Your code, per request | Request body limit of your plan (100 MB on Free and Pro zones) |
| Presigned URL | None for the bytes | Your code decides who gets a URL | R2's limits |
| Multipart via Worker | Per part | Per part | Up to 10,000 parts |

### 3.11 Hyperdrive: Existing PostgreSQL and MySQL from Workers

Opening a new database connection from every isolate would mean a TCP and TLS handshake to a database far away on every request, and thousands of connections. **Hyperdrive** keeps a pool of connections near your database, terminates the handshake close to the Worker, and can cache read queries. Your code uses a normal driver with the connection string Hyperdrive provides.

```bash
npx wrangler hyperdrive create app-db --connection-string="postgres://app:secret@db.example.com:5432/app"
```

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "hyperdrive": [
    { "binding": "HYPERDRIVE", "id": "<hyperdrive-id>", "localConnectionString": "postgres://app:app@localhost:5432/app" }
  ]
}
```

```ts
import postgres from 'postgres';

export default {
  async fetch(request, env, ctx) {
    // A new client per request is cheap here: the expensive connection lives in Hyperdrive's pool.
    const sql = postgres(env.HYPERDRIVE.connectionString, { max: 5, fetch_types: false });
    try {
      const rows = await sql`SELECT id, email FROM users ORDER BY id LIMIT 10`;
      return Response.json(rows);
    } finally {
      ctx.waitUntil(sql.end());
    }
  },
} satisfies ExportedHandler<Env>;
```

| | D1 | Hyperdrive + your PostgreSQL |
| --- | --- | --- |
| Where the data lives | Cloudflare | Your cloud or data centre |
| Dialect | SQLite | PostgreSQL or MySQL |
| Scaling writes | Many small databases | Vertical scaling of your server, or its own sharding |
| Best for | New apps, per-tenant data | Existing apps, heavy relational workloads, extensions like PostGIS |

### 3.12 Testing Storage with the Vitest Plugin

`@cloudflare/vitest-plugin` runs each test file inside workerd with the bindings from `wrangler.jsonc`, backed by local storage that is **isolated per test**: writes in one test are rolled back before the next. The starter's [vitest.config.ts](vitest.config.ts):

```ts
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const migrations = await readD1Migrations('./migrations');

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: { ADMIN_TOKEN: 'test-token', TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: {
      setupFiles: ['./test/apply-migrations.ts'],
    },
  };
});
```

```ts
// test/apply-migrations.ts
import { applyD1Migrations, env } from 'cloudflare:test';

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
```

| Piece | Runs in | Job |
| --- | --- | --- |
| `readD1Migrations('./migrations')` | Node.js (config time) | Reads and splits the SQL files; workerd has no filesystem access to your repo |
| `miniflare.bindings` | Config | Adds test-only bindings: the secret and the migration list |
| `applyD1Migrations()` | workerd (setup file) | Applies unapplied migrations to the test database |
| `env` from `cloudflare:test` | workerd | The real bindings object your Worker receives |

A test that checks D1, KV and `waitUntil` together, from [test/worker.test.ts](test/worker.test.ts) and [test/helpers.ts](test/helpers.ts):

```ts
export async function call(
  path: string,
  init: RequestInit<IncomingRequestCfProperties> = {},
): Promise<Response> {
  const request = new IncomingRequest(`https://sho.rt${path}`, init);
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx); // let ctx.waitUntil() work finish before asserting
  return response;
}
```

```ts
it('creates, redirects, counts clicks and caches in KV', async () => {
  const created = await postJson('/api/links', { url: 'https://developers.cloudflare.com', slug: 'cf-docs' });
  expect(created.status).toBe(201);

  const first = await call('/cf-docs');
  expect(first.status).toBe(302);
  expect(await env.LINKS_CACHE.get('link:cf-docs', 'json')).toMatchObject({
    url: 'https://developers.cloudflare.com/',
  });

  await call('/cf-docs'); // served from KV this time

  const stats = await call('/api/links/cf-docs', { headers: ADMIN });
  expect(await stats.json()).toMatchObject({ slug: 'cf-docs', clicks: 2 });
});
```

Two calling styles, both in the suite:

| Style | How | Use when |
| --- | --- | --- |
| Unit: call the handler | `worker.fetch(request, env, ctx)` then `waitOnExecutionContext(ctx)` | You need to await background work or pass a custom `env` |
| Integration: through the runtime | `exports.default.fetch(url)` from `cloudflare:workers` | You want the request to enter exactly as it would from the edge |

### 3.13 Pitfalls

| Pitfall | Symptom | Fix |
| --- | --- | --- |
| Counter in KV | Counts lower than reality under concurrency | D1 `UPDATE ... SET n = n + 1` or a Durable Object |
| Writing the same KV key more than once a second | `KV PUT failed: 429 Too Many Requests` | Batch updates, shard the key, or move to a Durable Object |
| `expirationTtl` below 60 | `put()` rejects with a 400 `Invalid expiration_ttl` error | Clamp to 60 as the starter does |
| Building SQL with template strings | SQL injection; `D1_ERROR: near "...": syntax error` on quotes | Always `prepare()` + `bind()` |
| `BEGIN TRANSACTION` in a query | The statement fails: D1 manages transactions itself and does not let SQL text open them | Use `db.batch()` for atomicity |
| Forgetting `--remote` on migrations | Production throws `D1_ERROR: no such table: links` after deploy | `wrangler d1 migrations apply DB --remote` in the deploy job, before `wrangler deploy` |
| Unindexed filter on a growing table | Query `duration` and `rows_read` climb; the database's throughput collapses | Check `meta.rows_read`, add an index, run `EXPLAIN QUERY PLAN` |
| Streaming a body of unknown length to R2 | `TypeError: Provided readable stream must have a known length (request/response body or readable half of FixedLengthStream)` | Require `Content-Length`, or pipe through `new FixedLengthStream(n)` |
| Using `object.etag` in an `ETag` header | Conditional requests never match | Use `object.httpEtag`, which includes the quotes |
| Abandoned multipart uploads | Storage bill includes invisible parts | `abort()` on failure and an object lifecycle rule for incomplete uploads |
| New `postgres()` client without `sql.end()` | Connection count climbs in the pool | `ctx.waitUntil(sql.end())` |

### 3.14 Best Practices

- **Pick the store by consistency need first, then by data shape**: wrong consistency is a correctness bug; wrong shape is a performance bug.
- **Keep one source of truth and treat KV as a cache**: the starter can rebuild every KV entry from D1, so stale or lost cache data never loses information.
- **Store expiry with cached values**: a cache that cannot tell an entry is logically expired will serve it until KV evicts it.
- **Use `RETURNING` and `meta.changes` instead of read-then-write**: one round trip, no race.
- **Run migrations before code, and keep them backwards compatible**: old and new versions run together during every rollout.
- **Watch `rows_read` and `duration` in D1 query metadata**: they predict both cost and how close a database is to its write throughput.
- **Split data into many small D1 databases when tenants are independent**: each database gets its own writer and size budget.
- **Stream to and from R2**: never `arrayBuffer()` a file the user uploaded.
- **Test storage in workerd with isolated state**: the Vitest plugin gives you real KV/D1/R2 semantics with no cleanup code.

### 3.15 Hands-on Exercise

Add `GET /api/links?limit=20&after=<slug>` that lists links in slug order with **keyset pagination**:

1. Require the admin token.
2. Validate `limit` (1-100, default 20) and return 400 otherwise.
3. Query `WHERE slug > ?1 ORDER BY slug LIMIT ?2`, fetching `limit + 1` rows so you know whether another page exists.
4. Return `{ "links": [...], "next": "<last slug>" | null }`.
5. Explain in a comment why `OFFSET` would get slower on later pages and this does not.

Expected output after creating `aaa`, `bbb` and `ccc`:

```json
{ "links": [{ "slug": "aaa", "url": "https://aaa.dev/", "clicks": 0 }, { "slug": "bbb", "url": "https://bbb.dev/", "clicks": 0 }], "next": "bbb" }
```

The solution is [solutions/stage3-list.ts](solutions/stage3-list.ts), tested in [test/solutions.test.ts](test/solutions.test.ts). Stretch goal: add `?prefix=` with a `LIKE ?1 || '%'` filter and an index that supports it.

[Back to top ⤴️](#-table-of-contents)

---

## 4. Stage 4: Stateful and Asynchronous Compute: Durable Objects, Queues and Workflows

This stage covers the products that hold state or outlive a request. Durable Objects: one single-threaded instance per ID, SQLite storage through `ctx.storage.sql`, input and output gates, alarms, and WebSocket hibernation for real-time rooms. Queues: producers, batched consumers, `ack()`/`retry()` with delays, dead-letter queues and why delivery is at-least-once. Workflows: `WorkflowEntrypoint`, `step.do()` with retries, `step.sleep()` and `step.waitForEvent()`. It also compares Cron Triggers, Queues and Workflows for background jobs. The starter's fire-and-forget click counter (section 2.5) becomes an exact counter in a Durable Object and an event stream on a Queue.

[Back to top ⤴️](#-table-of-contents)

---

## 5. Stage 5: Networking, Security and Zero Trust

This stage puts a zone in front of the Worker: DNS records and proxy status, SSL/TLS modes, Cache Rules and tiered cache, the WAF with managed and custom rules, rate limiting rules and the Workers rate limiting binding, Turnstile for bot checks, mTLS client certificates, and Cloudflare Access plus Tunnel to publish internal services without opening inbound ports. It also covers Workers static assets against Pages, secure headers, CORS, and secrets in Secrets Store. The starter's bearer-token admin API (section 2.4) moves behind Access.

[Back to top ⤴️](#-table-of-contents)

---

## 6. Stage 6: Observability, CI/CD, Performance and Cost

This stage runs the Worker in production: Workers Logs queries, `wrangler tail`, automatic tracing, Tail Workers, Workers Analytics Engine for custom metrics, and alerting. Delivery covers GitHub Actions with `cloudflare/wrangler-action`, preview URLs, gradual deployments and version overrides. Performance covers CPU profiling with DevTools, bundle size, Smart Placement, and caching layers. Cost covers the request and CPU pricing model, how D1 `rows_read`, KV operations and R2 Class A/B operations add up, and how to read the bill. The repo's [Dockerfile](Dockerfile) shows how the same bundle runs off-platform on workerd.

[Back to top ⤴️](#-table-of-contents)

---

## M1. Masterclass: Inside workerd: Isolates, Scheduling and Limits

How workerd loads a bundle into an isolate, how one thread interleaves requests, how CPU time is measured and enforced, why `Date.now()` is frozen during execution, the Spectre mitigations that shape the API, and how to profile CPU and memory in DevTools with `wrangler dev`.

[Back to top ⤴️](#-table-of-contents)

---

## M2. Masterclass: Durable Objects at Scale: Coordination Patterns

Sharding hot objects, per-tenant objects, distributed rate limiters and locks, WebSocket fan-out with hibernation, alarms as durable timers, point-in-time recovery of SQLite storage, and the failure modes of a single-threaded object under load.

[Back to top ⤴️](#-table-of-contents)

---

## M3. Masterclass: AI on the Edge: Workers AI, Vectorize and AI Gateway

Running inference with the `AI` binding, embeddings into Vectorize for retrieval, caching and rate limiting model calls through AI Gateway, streaming tokens to the browser, and cost control.

[Back to top ⤴️](#-table-of-contents)

---

## M4. Masterclass: Containers and Hybrid Architectures

When isolates are the wrong tool: Cloudflare Containers controlled from a Worker and a Durable Object, Hyperdrive to an existing database, Tunnel to private services, and migrating a Node.js service to Workers incrementally behind a route.

[Back to top ⤴️](#-table-of-contents)

---

## M5. Masterclass: Flagship Blueprint: A Production Link Platform

An end-to-end build on the starter: custom domain, Access-protected admin, D1 with read replication, KV cache, R2 uploads with presigned URLs, exact analytics through Queues and Analytics Engine, per-link rate limits in Durable Objects, a Workflow for abuse review, CI with migrations and gradual deployments, and dashboards.

[Back to top ⤴️](#-table-of-contents)

---

## 7. Stage 7: Staff Cloudflare Platform Engineer Interview Handbook & Cheatsheet

### 7.1 Core Concepts (Q1-Q2)

#### Q1. What are the fundamental architectural trade-offs of building on Cloudflare Workers?

The central trade is **startup cost and placement against execution limits**. V8 isolates start in milliseconds and run in every location, so you get low latency worldwide without choosing regions or keeping instances warm. In exchange you accept a constrained environment: 128 MB of memory per isolate, CPU-time limits per invocation, no general filesystem, no native add-ons, and a JavaScript/Wasm runtime that is close to, but not, Node.js. Workloads that fit (request handling, APIs, auth, transformation, orchestration of I/O) gain a lot; workloads that do not (long CPU-bound jobs, large native libraries) need Containers, Workflows or another platform.

The second trade is **data locality**. Compute is everywhere but each kind of storage has a home: a D1 primary in one region, Durable Objects in one location each, KV centrally with edge caches. A Worker in Sydney that makes five sequential queries to a D1 primary in Europe is slower than a regional server next to the database. The design responses are caching (KV, Cache API), read replicas (D1 Sessions API), moving compute next to data (Smart Placement), and partitioning data so each user's data lives near them (per-tenant databases or Durable Objects).

The third is **consistency per product**. KV is eventually consistent, D1 is strong at the primary, R2 is strongly consistent, and Durable Objects serialise all access to one object. Choosing the wrong one is a correctness bug, not a tuning issue, so staff engineers make the consistency requirement explicit in design reviews.

| Decision | Gain | Cost |
| --- | --- | --- |
| Isolates instead of containers | Millisecond cold starts, high density, low price | Memory and CPU limits, restricted APIs |
| Run in every location | Low latency to users, no region planning | Distance to the data; must design for locality |
| Bindings instead of credentials | No secrets for platform resources, easy fakes in tests | Platform lock-in at the binding API |
| Per-product consistency models | Each store is simple and fast for its use case | You must pick correctly and combine them |
| Billing on CPU time, not wall time | Waiting on I/O is free | CPU-heavy code is relatively expensive |

#### Q2. How do you design a Workers application for zero-downtime deploys and fast recovery?

Start with how Workers deploy. There is no process to drain: a new version starts taking new requests while in-flight requests finish on the old one. Use **versions and gradual deployments** for anything user-facing: `wrangler versions upload`, then `wrangler versions deploy new@5% old@95%`, watch error rate and latency per version in Workers Logs, and widen the rollout in steps. `wrangler rollback` restores the previous deployment in seconds.

Code rollback is only safe if **data is compatible in both directions**. During any rollout both versions read and write the same D1 database, KV namespace and Durable Objects. Apply migrations before code and make them additive (expand and contract), keep message and cache formats readable by the previous version, and version Durable Object storage formats. For data mistakes, D1 Time Travel restores a database to a point in time, so take note of the timestamp before risky migrations.

Then make requests **safe to retry**, because clients and Cloudflare's own failure handling will retry them. Use idempotency keys for `POST` operations, `INSERT ... ON CONFLICT` and `RETURNING` instead of read-then-write, and put timeouts on every subrequest with `AbortSignal.timeout()`. For dependencies outside Cloudflare, add a circuit breaker (state in a Durable Object if it must be shared) and degrade to cached data where you can. Finally, wire **health and alerts**: a cheap `/health` route for synthetic checks, structured logs with the version ID, and alerts on error rate per version, so a bad release is caught in the canary and not at 100%.

```bash
npx wrangler d1 migrations apply DB --remote          # 1. additive schema first
npx wrangler versions upload --message "v1.4.0"       # 2. upload without traffic
npx wrangler versions deploy <new>@5% <old>@95% -y    # 3. canary
npx wrangler versions deploy <new>@100% -y            # 4. promote when metrics are clean
npx wrangler rollback                                  # or: instant rollback
```

### 7.5 Staff Cheatsheet

| Need | Cloudflare answer | Gotcha |
| --- | --- | --- |
| Runtime configuration | `vars` and secrets as bindings, typed by `wrangler types` | Vars are strings; secrets are invisible to `wrangler types` without `.dev.vars` |
| Error handling | One `try/catch` boundary that maps typed errors to responses | Uncaught errors show Cloudflare's 1101 page |
| Background work | `ctx.waitUntil()` for best effort, Queues for guaranteed | Unawaited promises outside `waitUntil` may be cancelled |
| Global read-heavy data | KV with `cacheTtl` | Eventual consistency; 1 write per second per key |
| Relational data | D1, many small databases | One writer per database; no SQL-level transactions, use `batch()` |
| Files | R2 via binding, presigned URLs for direct uploads | Streams need a known length |
| Exact counters, locks, rooms | Durable Objects | One object is one thread; shard hot keys |
| Existing PostgreSQL | Hyperdrive | Needs `nodejs_compat`; close clients with `waitUntil(sql.end())` |
| Worker-to-Worker calls | Service binding RPC | Calling your own hostname with `fetch()` does not work |
| Safe releases | `wrangler versions upload` + gradual `versions deploy` | Rollback does not roll back migrations |
| Local fidelity | `wrangler dev` and the Vitest plugin on workerd | No production limits, latency or zone rules locally |

[Back to top ⤴️](#-table-of-contents)

---

## 🧪 Example Projects

| Project | Builds on | What you practise | Stretch goal |
| --- | --- | --- | --- |
| [Starter: link shortener with file hosting](./src/index.ts) (in this repo) | [Stage 1](#1-stage-1-platform-foundations-wrangler-and-the-workers-runtime)-[Stage 3](#3-stage-3-storage-at-the-edge-kv-d1-r2-and-hyperdrive) | Routing, bindings, D1 + KV read-through cache, R2 uploads, cron, tests in workerd | Add the exercise solutions, then exact click analytics through a Queue |
| Feature-flag service | [3.2](#32-workers-kv-model-and-consistency), [2.10](#210-service-bindings-and-rpc) | KV with metadata, RPC entrypoint consumed by other Workers | Percentage rollouts hashed on user ID |
| Image proxy and resizer | [2.6](#26-subrequests-with-fetch), [3.9](#39-r2-object-storage-without-egress-fees) | Subrequest caching, R2 as origin, conditional requests | Signed URLs so only your site can request resizes |
| A/B testing at the edge | [2.7](#27-streams-and-htmlrewriter), [2.8](#28-the-cache-api-vs-the-cdn-cache) | `HTMLRewriter`, cookies, cache keys per variant | Report conversions to Analytics Engine |
| Multi-tenant notes API | [3.5](#35-d1-sqlite-as-a-service)-[3.8](#38-d1-read-replication-and-the-sessions-api) | One D1 database per tenant, migrations across many databases, Sessions API | Tenant export to R2 as NDJSON |
| Webhook relay | [2.5](#25-executioncontext-waituntil-and-passthroughonexception), [Stage 4](#4-stage-4-stateful-and-asynchronous-compute-durable-objects-queues-and-workflows) | Signature verification, Queues with retries and DLQ | Replay from R2 archive |
| Existing PostgreSQL API on Workers | [3.11](#311-hyperdrive-existing-postgresql-and-mysql-from-workers) | Hyperdrive, `postgres` driver, query caching | Smart Placement and latency comparison |
| Real-time chat room | [Stage 4](#4-stage-4-stateful-and-asynchronous-compute-durable-objects-queues-and-workflows) | Durable Objects, WebSocket hibernation, SQLite storage | Presence and message history pagination |

## 📝 Cheat Sheets

### CLI / Commands

```bash
# Project and auth
npm create cloudflare@latest my-app -- --type=hello-world --lang=ts
npx wrangler login
npx wrangler whoami
npx wrangler types                       # regenerate worker-configuration.d.ts
npx wrangler types --check               # CI: fail when stale

# Develop and deploy
npx wrangler dev                         # local workerd on :8787
npx wrangler dev --remote                # run on Cloudflare's network
npx wrangler dev --test-scheduled        # expose /__scheduled for cron testing
npx wrangler deploy                      # upload + 100% deploy
npx wrangler deploy --env staging
npx wrangler deploy --dry-run --outdir dist   # bundle only
npx wrangler tail --format pretty        # live logs

# Versions and rollback
npx wrangler versions upload --message "msg"
npx wrangler versions list
npx wrangler versions deploy <id>@10% <old-id>@90%
npx wrangler deployments list
npx wrangler rollback

# Secrets
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret list
npx wrangler secret delete ADMIN_TOKEN

# KV (local by default in Wrangler 4; add --remote for production)
npx wrangler kv namespace create LINKS_CACHE
npx wrangler kv key put greeting "hello" --binding LINKS_CACHE --remote
npx wrangler kv key get greeting --binding LINKS_CACHE --remote
npx wrangler kv key list --binding LINKS_CACHE --prefix link: --remote
npx wrangler kv bulk put bulk.json --binding LINKS_CACHE --remote

# D1
npx wrangler d1 create learn-cloudflare-links --location=weur
npx wrangler d1 migrations create DB add_owner_column
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 execute DB --remote --command "SELECT count(*) FROM links"
npx wrangler d1 export DB --remote --output=backup.sql
npx wrangler d1 time-travel info DB

# R2
npx wrangler r2 bucket create learn-cloudflare-files
npx wrangler r2 object put learn-cloudflare-files/hello.txt --file=hello.txt --remote
npx wrangler r2 object get learn-cloudflare-files/hello.txt --remote

# Hyperdrive
npx wrangler hyperdrive create app-db --connection-string="postgres://user:pass@host:5432/db"
```

### Workers API Quick Reference

| Task | Code |
| --- | --- |
| Module Worker | `export default { fetch(req, env, ctx) { ... } } satisfies ExportedHandler<Env>` |
| JSON response | `Response.json(data, { status: 201 })` |
| Redirect | `Response.redirect(url, 302)` |
| Read JSON body | `const body = await request.json<MyType>()` |
| Query string | `new URL(request.url).searchParams.get('q')` |
| Path params | `new URLPattern({ pathname: '/users/:id' }).exec(request.url)?.pathname.groups.id` |
| Edge location | `request.cf?.colo` |
| Modify fetched response | `const res = new Response(upstream.body, upstream); res.headers.set('x', 'y')` |
| Background work | `ctx.waitUntil(promise)` |
| Subrequest deadline | `fetch(url, { signal: AbortSignal.timeout(3000) })` |
| Cache API | `await caches.default.match(request)` / `ctx.waitUntil(caches.default.put(request, res.clone()))` |
| KV read/write | `await env.KV.get(key, 'json')` / `await env.KV.put(key, value, { expirationTtl: 3600 })` |
| D1 query | `await env.DB.prepare('SELECT * FROM t WHERE id = ?1').bind(id).first()` |
| D1 transaction | `await env.DB.batch([stmt1, stmt2])` |
| D1 replica reads | `const s = env.DB.withSession(bookmark); s.getBookmark()` |
| R2 upload/download | `await env.BUCKET.put(key, request.body)` / `await env.BUCKET.get(key, { onlyIf: request.headers })` |
| RPC entrypoint | `export default class extends WorkerEntrypoint<Env> { async method() {} }` |
| Bindings at module scope | `import { env } from 'cloudflare:workers'` |
| Test a handler | `const ctx = createExecutionContext(); await worker.fetch(req, env, ctx); await waitOnExecutionContext(ctx)` |

## 📚 Resources

- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/) and [configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) and [pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) and [flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)
- [Workers KV](https://developers.cloudflare.com/kv/), [D1](https://developers.cloudflare.com/d1/), [R2](https://developers.cloudflare.com/r2/), [Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/), [Queues](https://developers.cloudflare.com/queues/), [Workflows](https://developers.cloudflare.com/workflows/)
- [Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/)
- [Cloudflare changelog](https://developers.cloudflare.com/changelog/) and [blog](https://blog.cloudflare.com/)
- [workers-sdk repository](https://github.com/cloudflare/workers-sdk) (Wrangler, Miniflare, C3, Vitest plugin) and [workerd repository](https://github.com/cloudflare/workerd)

## 🤝 Contributing

Contributions are welcome. Read the [contributing guide](https://github.com/TheLearningHubOrg/.github/blob/main/CONTRIBUTING.md) and the [code of conduct](https://github.com/TheLearningHubOrg/.github/blob/main/CODE_OF_CONDUCT.md) before you open a pull request. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), which drive the automated changelog.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Cloudflare](https://www.cloudflare.com/) and the [Workers developer platform](https://developers.cloudflare.com/workers/)
- [Wrangler, Miniflare and the Vitest plugin](https://github.com/cloudflare/workers-sdk) from the workers-sdk project
- [workerd](https://github.com/cloudflare/workerd), the open-source Workers runtime
- [Vitest](https://vitest.dev/) and [TypeScript](https://www.typescriptlang.org/)

## 🌐 Connect with me

- [Twitter](https://twitter.com/manthan_ank)
- [LinkedIn](https://www.linkedin.com/in/manthanank)
- [Facebook](https://www.facebook.com/manthanank/)
- [Instagram](https://www.instagram.com/manthan_ank/)
- [YouTube](https://www.youtube.com/@manthanank)
- [GitHub](https://github.com/manthanank)

## ☕ Support

If you like this learning repository and find it useful, consider buying me a coffee or sponsoring me through GitHub Sponsors. Your support helps me keep these guides up to date. Thank you!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-FFDD00?logo=buymeacoffee&logoColor=000)](https://www.buymeacoffee.com/manthanank)

[![Sponsor Me](https://img.shields.io/badge/Sponsor-GitHub-green?logo=github)](https://github.com/sponsors/manthanank)

---

Show your support by 🌟 the repository.
