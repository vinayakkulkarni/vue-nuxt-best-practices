---
name: nuxt-agent-ready-best-practices
description: "Nuxt agent-readiness guidelines for making a site operable by autonomous AI agents — not just cited by them. Covers the isitagentready.com standards: Markdown content negotiation, RFC 8288 Link headers, RFC 9727 API catalogs, Agent Skills discovery indexes, WebMCP browser tools, MCP Server Cards, OAuth/OIDC agent auth discovery, and DNS-AID. Triggers on tasks involving agent-ready, isitagentready, MCP, WebMCP, model context protocol, agent skills, API catalog, well-known discovery, agent auth, DNS-AID, A2A, or agentic commerce."
license: MIT
metadata:
  author: vinayakkulkarni
  version: "1.0.0"
---

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
