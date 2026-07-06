---
title: Publish OAuth/OIDC Discovery (Only If You Run an Auth Server)
impact: LOW
impactDescription: Lets agents programmatically discover how to authenticate — but only meaningful when a real authorization server backs it
tags: oauth, oidc, discovery, well-known, agent-auth, honesty-gate
---

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
