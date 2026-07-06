# Nuxt Agent-Ready Best Practices - Complete Reference

> This file is auto-generated. Do not edit directly.
> Edit individual rule files in the `rules/` directory and run `bun run build`.

# Nuxt Agent-Ready Best Practices

Guidelines for making a Nuxt 4 site **operable by autonomous AI agents** — measured by the [isitagentready.com](https://isitagentready.com) scanner (Cloudflare's "Is Your Site Agent-Ready?"). This is a different axis from GEO: GEO is about being *cited* in AI answers; agent-readiness is about being *operated* — an agent authenticating, discovering your API, calling your tools, and taking action.

Proven on a production Nuxt 4 + Nitro `cloudflare_module` Worker: score **21 → 50+ (Level 1 → Level 4 "Agent-Integrated")**.

## GEO vs Agent-Readiness (know the difference)

| | GEO (`nuxt-geo-best-practices`) | Agent-Readiness (this skill) |
|---|---|---|
| Goal | Be **cited** in AI answers | Be **operated** by agents |
| Question | "Will ChatGPT mention me?" | "Can an agent call my tools and act?" |
| Levers | llms.txt, crawler allowlist, RAG content, JSON-LD entities | MCP/WebMCP, API/skill discovery, agent auth, DNS-AID, agentic commerce |

**Shared primitives live in the GEO skill.** `robots.txt` AI-crawler allowlisting, `llms.txt`/`llms-full.txt`, and the XML sitemap are covered by `nuxt-geo-best-practices` (rules `ai-robots-allowlist`, `ai-llms-txt`, `ai-sitemap`). The isitagentready scanner scores those too — set them up via the GEO skill first, then apply this skill for the agent-operation layer on top.

## When to Apply

- Raising a site's score on `https://isitagentready.com/<domain>`
- Supporting `Accept: text/markdown` content negotiation for agents
- Advertising resources via RFC 8288 `Link` headers
- Publishing an RFC 9727 API catalog (`/.well-known/api-catalog`)
- Publishing an Agent Skills discovery index (`/.well-known/agent-skills/index.json`)
- Exposing site actions to in-browser agents via WebMCP (`navigator.modelContext`)
- Publishing an MCP Server Card (only if you run a real MCP server)
- Publishing OAuth/OIDC discovery for agent auth (only if you run a real auth server)
- Publishing DNS-AID records (`_index._agents.<domain>`) + DNSSEC

## THE HONESTY RULE (load-bearing — read before publishing anything)

**Only publish discovery for services that actually exist.** A discovery document that sends an agent to a dead end — a `/.well-known/openid-configuration` with no auth server behind it, an MCP Server Card whose transport endpoint 404s, a `_mcp._agents` DNS record with no MCP server — is **worse than a lower score**. Agents will try to use it and fail.

This mirrors the "never fake customers/logos/scale" rule: a fabricated capability that fails on first contact destroys trust. On a marketing site with only public POST endpoints, **skip** OAuth/OIDC discovery, oauth-protected-resource, auth.md, and the MCP Server Card — they belong on the app/console domain (real auth server) or require building a real MCP server. Decline these explicitly and say why.

## THE NITRO/WORKERS GOTCHA (self-referential renders)

Several checks require "render my own page, then transform it" (llms-full.txt aggregation, markdown negotiation). On a deployed Cloudflare Worker, an **absolute-URL** `$fetch('https://<origin>/path')` becomes a real edge subrequest that returns **empty** on the same-zone self-loopback — but it works on `wrangler dev` (single local server), so the bug is invisible until production.

Always use **relative in-process** `event.$fetch(path, { headers })` — Nitro's internal router, no network hop, identical on dev and prod. Works in both route handlers and middleware. This silently served an empty 81-byte `llms-full.txt` in production for weeks before it was caught.

## Verification Discipline

1. Build + boot on `wrangler dev` (workerd); `curl` each route/header.
2. **CRITICAL: verify on PRODUCTION after deploy** — the self-`$fetch` bug only manifests in prod. Confirm `llms-full.txt` is full-size (not ~81 bytes) and markdown negotiation returns `text/markdown`.
3. Fetch each check's hosted `SKILL.md` at `https://isitagentready.com/.well-known/agent-skills/<check>/SKILL.md` for the exact record/format the scanner validates.
4. Re-scan `isitagentready.com/<domain>` to confirm the category flipped green. The scan API is `POST https://isitagentready.com/api/scan` `{"url":"https://<domain>"}` → check `checks.<category>.<check>.status === "pass"`.

## Rule Categories

- **discovery** — Link headers, API catalog, agent-skills index, markdown negotiation, WebMCP, MCP server card, DNS-AID
- **content** — markdown content negotiation
- **auth** — OAuth/OIDC + protected-resource + auth.md (honesty-gated)
- **dns** — DNS-AID records + DNSSEC

Commerce checks (x402, MPP, UCP, ACP) are informational-only on non-commerce sites and do NOT affect the score — skip them unless the site actually sells to agents.

---

# Detailed Rules

### Publish OAuth/OIDC Discovery (Only If You Run an Auth Server)

**Impact:** LOW - Lets agents programmatically discover how to authenticate — but only meaningful when a real authorization server backs it

## Publish OAuth/OIDC Discovery (Only If You Run an Auth Server)

isitagentready checks for OAuth/OIDC discovery so agents can authenticate with protected APIs:

- `/.well-known/openid-configuration` ([OIDC Discovery](http://openid.net/specs/openid-connect-discovery-1_0.html))
- `/.well-known/oauth-authorization-server` ([RFC 8414](https://www.rfc-editor.org/rfc/rfc8414))
- `/.well-known/oauth-protected-resource` ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728))
- `/auth.md` ([WorkOS auth.md](https://workos.com/auth-md)) — agent registration instructions

### HONESTY GATE — do not publish these on a site with no auth server

These are only legitimate when a **real authorization server** issues tokens. A marketing site whose `/api/v1/*` endpoints are public has no `authorization_endpoint`/`token_endpoint` — publishing this discovery points agents at nothing and they fail on first token request. **Skip it.** If you want the score, put it on the domain that actually runs auth (e.g. your app/console with Better Auth), mapping the *real* endpoints.

**Correct (only where a real OIDC/OAuth server exists — e.g. the console app):**

```ts
// server/routes/.well-known/openid-configuration.ts  (on app.your-site.com, NOT the marketing site)
import type { H3Event } from 'h3';

const ISSUER = 'https://app.your-site.com';

export default defineEventHandler((event: H3Event) => {
  setHeader(event, 'Content-Type', 'application/json');
  return {
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/api/v1/auth/authorize`, // must be REAL
    token_endpoint: `${ISSUER}/api/v1/auth/token`,             // must be REAL
    jwks_uri: `${ISSUER}/api/v1/auth/jwks`,                    // must be REAL
    grant_types_supported: ['authorization_code', 'refresh_token'],
    response_types_supported: ['code'],
    scopes_supported: ['openid', 'email', 'profile'],
  };
});
```

Map every field to an endpoint your auth stack actually serves. With Better Auth, point these at its real mounted routes — do not invent paths.

### Verify

```bash
curl -s https://app.your-site.com/.well-known/openid-configuration | jq '.issuer, .token_endpoint'
# then confirm the token_endpoint actually responds (not 404)
curl -s -o /dev/null -w '%{http_code}\n' https://app.your-site.com/api/v1/auth/token
```

Reference: [OIDC Discovery](http://openid.net/specs/openid-connect-discovery-1_0.html) · [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414) · [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) · [auth.md](https://github.com/workos/auth.md)

---

### Serve Markdown via Accept Content Negotiation

**Impact:** HIGH - The entire Content category on isitagentready — agents that request text/markdown get clean markdown instead of a JS-heavy HTML shell

## Serve Markdown via `Accept` Content Negotiation

Agents send `Accept: text/markdown` to ask for a clean markdown rendering of a page. Return markdown for those requests while HTML stays the default for browsers. This is the whole **Content** category on isitagentready and follows [Cloudflare's Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/).

### The critical Nitro/Workers trap

To render markdown you re-fetch the page's own HTML. On a deployed Worker an **absolute-URL** `$fetch('https://origin/path')` becomes a real edge subrequest that returns **empty** on the same-zone self-loopback — but works on `wrangler dev`, so the bug is invisible until production. Use relative **`event.$fetch(path)`** (in-process, no network hop).

**Incorrect (absolute URL — empty in prod, works on dev):**

```ts
// ❌ Returns '' on the deployed Worker's self-loopback
const html = await $fetch(`https://your-site.com${path}`, {
  headers: { Accept: 'text/html' },
});
```

**Correct (relative in-process fetch + Vary header):**

```ts
// server/middleware/agent-ready.ts (same middleware as the Link-header rule)
import type { H3Event } from 'h3';

const MARKDOWN_ROUTES = new Set(['/', '/pricing', '/about', '/how-it-works']);

export default defineEventHandler(async (event: H3Event) => {
  if (event.method !== 'GET') return;

  const path = getRequestURL(event).pathname;
  const accept = getHeader(event, 'accept') ?? '';

  // Only intercept when the agent explicitly prefers markdown AND it's a known
  // prose page. The Accept:text/html subrequest below re-enters this middleware
  // but skips this branch, so there is no loop — the Accept guard is load-bearing.
  if (!accept.includes('text/markdown') || !MARKDOWN_ROUTES.has(path)) return;

  const html = await event
    .$fetch<string>(path, { headers: { Accept: 'text/html' } })
    .catch(() => '');
  const markdown = htmlToMarkdown(html);
  if (!markdown) return;

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8');
  setHeader(event, 'Vary', 'Accept'); // so CDN caches HTML and markdown separately
  return `# ${path}\n\n${markdown}\n`;
});
```

Scope the HTML to `<main>` and convert headings/lists before stripping tags so the markdown keeps structure. Set `Vary: Accept` or a CDN may serve markdown to a browser (or vice-versa).

### Verify (BOTH dev and prod)

```bash
# agent gets markdown
curl -s https://your-site.com/pricing -H 'Accept: text/markdown' -o /dev/null -w '%{content_type}\n'
# text/markdown; charset=utf-8

# browser still gets HTML
curl -s https://your-site.com/pricing -H 'Accept: text/html' -o /dev/null -w '%{content_type}\n'
# text/html; charset=utf-8
```

The self-`$fetch` bug ONLY shows in production — always verify on the live Worker, not just `wrangler dev`.

Reference: [Cloudflare Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) · [Nitro `event.$fetch`](https://nitro.build/guide/fetch)

---

### Publish an Agent Skills Discovery Index

**Impact:** MEDIUM - Lets agents discover downloadable SKILL.md capabilities you offer, each verified by a sha256 digest

## Publish an Agent Skills Discovery Index

The [Agent Skills Discovery RFC v0.2.0](https://github.com/cloudflare/agent-skills-discovery-rfc) defines `/.well-known/agent-skills/index.json` — a catalog of downloadable `SKILL.md` artifacts an agent can consume. Publish **one real skill per genuine capability** (e.g. your public API); each entry carries a `sha256` digest of the artifact.

### The digest-drift trap

Each skill entry includes `digest: "sha256:<hex>"` of the SKILL.md artifact. If a formatter (oxfmt/prettier) reformats the SKILL.md, its bytes change and the digest no longer matches — the scanner (or a verifying agent) rejects it. **Format the SKILL.md FIRST, then compute the digest, then write the index.** Re-verify `served-file-sha256 == indexed-digest` after any edit.

**Correct (static index + artifact with a matching digest):**

```jsonc
// public/.well-known/agent-skills/index.json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "free-audit",
      "type": "skill-md",
      "description": "Run the free Google Business Profile audit and get a scorecard.",
      "url": "https://your-site.com/.well-known/agent-skills/free-audit/SKILL.md",
      "digest": "sha256:0b7afdf087ec3becec2a535ec3561db3ef2b230626060250323526613d8db38a"
    }
  ]
}
```

```md
<!-- public/.well-known/agent-skills/free-audit/SKILL.md -->
# Run a free audit

POST https://your-site.com/api/v1/free-audit with { brand, email, consent:true }.
Returns a scorecard { score, locationCount, duplicates, summary, ... }.
```

Each `skills[]` entry needs `name` (lowercase-hyphen), `type` (`skill-md` | `archive`), `description`, `url`, `digest`.

### Compute + verify the digest

```bash
# 1. format the artifact FIRST
oxfmt public/.well-known/agent-skills/free-audit/SKILL.md
# 2. compute the digest and put it in index.json
shasum -a 256 public/.well-known/agent-skills/free-audit/SKILL.md
# 3. verify served file matches the indexed digest
diff <(shasum -a 256 SKILL.md | awk '{print $1}') <(grep -o 'sha256:[a-f0-9]*' index.json | cut -d: -f2)
```

Reference: [Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc) · [agentskills.io](https://agentskills.io)

---

### Publish an RFC 9727 API Catalog

**Impact:** MEDIUM - Lets agents discover your public API surface and machine-readable resources from one well-known document

## Publish an RFC 9727 API Catalog

[RFC 9727](https://www.rfc-editor.org/rfc/rfc9727) defines `/.well-known/api-catalog` — an `application/linkset+json` document that lets an agent discover your API surface and machine-readable resources. List **only real endpoints** (see the honesty rule): an agent that follows these links must reach something that works.

**Incorrect (no catalog — agent can't find your API):**

```
$ curl -s https://your-site.com/.well-known/api-catalog
404 Not Found
```

**Correct (Nitro route returning a linkset):**

```ts
// server/routes/.well-known/api-catalog.ts
import type { H3Event } from 'h3';

const ORIGIN = 'https://your-site.com';

export default defineEventHandler((event: H3Event) => {
  setHeader(event, 'Content-Type', 'application/linkset+json; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600');

  return {
    linkset: [
      {
        anchor: `${ORIGIN}/api/v1/free-audit`,
        'service-doc': [{ href: `${ORIGIN}/how-it-works` }],
        describedby: [{ href: `${ORIGIN}/llms.txt`, type: 'text/plain' }],
      },
      {
        anchor: ORIGIN,
        'service-meta': [
          { href: `${ORIGIN}/llms.txt`, type: 'text/plain' },
          { href: `${ORIGIN}/sitemap.xml`, type: 'application/xml' },
        ],
      },
    ],
  };
});
```

Each entry needs an `anchor` (the API/resource URL) plus link relations: `service-desc` (OpenAPI spec), `service-doc` (human docs), `service-meta`, `describedby`, `status` (health).

### Verify

```bash
curl -s https://your-site.com/.well-known/api-catalog -o /dev/null -w '%{http_code} %{content_type}\n'
# 200 application/linkset+json; charset=utf-8
```

Reference: [RFC 9727 (API Catalog)](https://www.rfc-editor.org/rfc/rfc9727) — see Appendix A for full examples.

---

### Advertise Resources with RFC 8288 Link Headers

**Impact:** HIGH - Lets agents discover llms.txt, sitemap, and your API catalog from any HTML response without guessing well-known paths

## Advertise Resources with RFC 8288 `Link` Headers

The isitagentready scanner checks for [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288) `Link` response headers on your homepage. They let an agent discover your machine-readable resources (`llms.txt`, sitemap, API catalog) from *any* response, instead of probing well-known paths one by one.

Implement once in a Nitro **server middleware** so every response carries them.

**Incorrect (no discovery hint — agent must guess):**

```
$ curl -sI https://your-site.com/ | grep -i '^link:'
# (nothing) — the agent has to blindly try /llms.txt, /sitemap.xml, /.well-known/...
```

**Correct (server middleware appends a `Link` header to every response):**

```ts
// server/middleware/agent-ready.ts
import type { H3Event } from 'h3';

const ORIGIN = 'https://your-site.com';

const LINK_HEADER = [
  `<${ORIGIN}/llms.txt>; rel="llms"; type="text/plain"`,
  `<${ORIGIN}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
  `<${ORIGIN}/.well-known/api-catalog>; rel="api-catalog"`,
].join(', ');

export default defineEventHandler((event: H3Event) => {
  appendHeader(event, 'Link', LINK_HEADER);
});
```

Use `appendHeader` (not `setHeader`) so you never clobber a `Link` header another handler set.

### Verify

```bash
curl -sI https://your-site.com/ | grep -i '^link:'
# link: <https://your-site.com/llms.txt>; rel="llms"; type="text/plain", ...
```

Reference: [RFC 8288 (Web Linking)](https://www.rfc-editor.org/rfc/rfc8288) · [IANA Link Relations](https://www.iana.org/assignments/link-relations/link-relations.xhtml)

---

### Publish an MCP Server Card (Only If You Run an MCP Server)

**Impact:** LOW - Lets agents discover your MCP server's transport and capabilities — but only meaningful when a real MCP server exists

## Publish an MCP Server Card (Only If You Run an MCP Server)

isitagentready checks for an [MCP Server Card](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) (SEP-1649) at `/.well-known/mcp/server-card.json` — `serverInfo`, a transport endpoint, and capabilities, so agents can discover and connect to your Model Context Protocol server.

### HONESTY GATE — do not publish a card for a server that doesn't exist

A Server Card advertises a **transport endpoint** an agent connects to. If you don't run an MCP server, that endpoint 404s and the agent's connection fails. **Skip it** unless you have a real MCP server. Building one is a genuine feature (see the `agents-sdk` skill for Cloudflare Workers MCP), not a well-known file — do that first, then publish the card pointing at the real transport.

**Correct (only where a real MCP server is mounted):**

```ts
// server/routes/.well-known/mcp/server-card.json.ts
import type { H3Event } from 'h3';

export default defineEventHandler((event: H3Event) => {
  setHeader(event, 'Content-Type', 'application/json');
  return {
    serverInfo: { name: 'your-app-mcp', version: '1.0.0' },
    transport: { type: 'streamable-http', endpoint: 'https://your-site.com/mcp' }, // must be REAL
    capabilities: { tools: {}, resources: {} },
  };
});
```

The `transport.endpoint` must be a real, connectable MCP server. Reference implementations: `maps.guru` and `talon` run real Workers-hosted MCP servers; a plain marketing site does not.

### Verify

```bash
curl -s https://your-site.com/.well-known/mcp/server-card.json | jq '.transport.endpoint'
# then confirm the endpoint actually speaks MCP (not 404)
curl -s -o /dev/null -w '%{http_code}\n' https://your-site.com/mcp
```

Reference: [MCP Server Card SEP-1649](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127) · build a real one with the `agents-sdk` skill

---

### Expose Site Actions via WebMCP

**Impact:** MEDIUM - In-browser agents can call your real site actions (search, submit, run) as MCP tools via navigator.modelContext

## Expose Site Actions via WebMCP

[WebMCP](https://webmachinelearning.github.io/webmcp/) ([Chrome blog](https://developer.chrome.com/blog/webmcp-epp)) lets an in-browser AI agent call your site's key actions as MCP tools through `navigator.modelContext`. Expose **real actions** (run a search, submit a form, fetch data) that map to real endpoints.

The API is Chrome-EPP-only and unstable, so every access must be **feature-detected** — the plugin is a harmless no-op in browsers without it.

### Types go in `app/types/` — never inline in the plugin

Per house rules, define no `interface`/`type` inline in a plugin. Put the WebMCP surface types in `app/types/webmcp.ts` and import them.

**Correct (types file + feature-detected client plugin):**

```ts
// app/types/webmcp.ts
export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

export type WebMcpModelContext = {
  registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
  provideContext?: (context: { tools: WebMcpTool[] }) => void;
};
```

```ts
// app/plugins/webmcp.client.ts  (.client — browser only)
import type { WebMcpModelContext, WebMcpTool } from '~/types/webmcp';

export default defineNuxtPlugin(() => {
  const nav = navigator as Navigator & { modelContext?: WebMcpModelContext };
  const mc = nav.modelContext;
  if (!mc) return; // no-op where the API is absent

  const runAudit: WebMcpTool = {
    name: 'run_free_audit',
    description: 'Run the free Google Business Profile audit for a brand.',
    inputSchema: {
      type: 'object',
      properties: { brand: { type: 'string' }, email: { type: 'string', format: 'email' } },
      required: ['brand', 'email'],
    },
    execute: async (input) =>
      $fetch('/api/v1/free-audit', {
        method: 'POST',
        body: { brand: input.brand, email: input.email, consent: true },
      }),
  };

  // Prefer the current registerTool API; fall back to older provideContext.
  if (typeof mc.registerTool === 'function') {
    mc.registerTool(runAudit, { signal: new AbortController().signal });
  } else if (typeof mc.provideContext === 'function') {
    mc.provideContext({ tools: [runAudit] });
  }
});
```

### Verify in a real browser (Playwright)

The scanner loads the page in a browser, so verify the same way — inject a fake `navigator.modelContext` before load and assert the tool registered:

```js
await page.addInitScript(() => {
  const calls = [];
  Object.defineProperty(navigator, 'modelContext', {
    value: { registerTool: (t) => calls.push(t.name) },
    configurable: true,
  });
  window.__mcp = calls;
});
await page.goto('https://your-site.com/');
console.log(await page.evaluate(() => window.__mcp)); // ['run_free_audit']
```

Reference: [WebMCP spec](https://webmachinelearning.github.io/webmcp/) · [Chrome WebMCP EPP](https://developer.chrome.com/blog/webmcp-epp)

---

### Publish DNS-AID Records with DNSSEC

**Impact:** MEDIUM - DNS-based agent discovery — a signed _index._agents record lets validating agents find your entrypoint

## Publish DNS-AID Records with DNSSEC

[DNS-AID](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) (DNS for AI Discovery) advertises agent entrypoints via DNS `SVCB`/`HTTPS` records under `_agents.<domain>`. The scanner probes `_index._agents`, `_a2a._agents`, `_mcp._agents`.

**Honesty gate:** only publish records for endpoints that exist. `_index._agents` pointing to your site is honest (the site serves llms.txt + api-catalog). Do NOT publish `_a2a._agents` or `_mcp._agents` unless you actually run an A2A or MCP server — those would send agents nowhere.

**Correct (create the record via the Cloudflare API):**

```js
// POST /zones/{zoneId}/dns_records
{
  type: 'HTTPS',
  name: '_index._agents.your-site.com',
  data: { priority: 1, target: 'your-site.com', value: 'alpn="h2,http/1.1" port=443' },
  ttl: 3600,
}
```

### The DNSSEC requirement (the real blocker)

DNS-AID draft-01 requires the discovery zone be **DNSSEC-signed** — the scanner needs `AD=true` (Authenticated Data) from a validating resolver. Publishing the record is not enough; without DNSSEC the check stays red with *"records found but DNSSEC was not validated"*.

Enabling DNSSEC is two steps and often **user-gated** (a default API token usually lacks the DNSSEC scope — error 10000):

1. **Enable DNSSEC in Cloudflare** (Zone → DNS → Settings → DNSSEC → Enable). This generates a **DS record**.
2. **Add that DS record at the domain registrar.** If the registrar is Cloudflare, it's one click; otherwise the user must paste the DS record into their registrar's DNSSEC settings. This is what signs the zone at the parent.

### Verify

```bash
# record resolves (scanner queries via DNS-over-HTTPS the same way)
curl -s 'https://cloudflare-dns.com/dns-query?name=_index._agents.your-site.com&type=65' \
  -H 'accept: application/dns-json' | jq '.Status'   # 0 = OK

# zone is DNSSEC-signed (AD flag true)
curl -s 'https://cloudflare-dns.com/dns-query?name=your-site.com&type=A&do=1' \
  -H 'accept: application/dns-json' | jq '.AD'        # true
```

Reference: [DNS-AID draft](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) · [RFC 9460 (SVCB/HTTPS records)](https://www.rfc-editor.org/rfc/rfc9460)
