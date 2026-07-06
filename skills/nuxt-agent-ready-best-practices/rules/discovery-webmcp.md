---
title: Expose Site Actions via WebMCP
impact: MEDIUM
impactDescription: In-browser agents can call your real site actions (search, submit, run) as MCP tools via navigator.modelContext
tags: webmcp, model-context-protocol, navigator-modelcontext, client-plugin, feature-detect
---

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
