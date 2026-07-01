# Nairobi Voices — Citizen Engagement SPA (wired to Bomet DIGIT)

A citizen complaint & engagement single-page app, wired to a **live DIGIT (eGov) PGR** backend.
Deployed on the Bomet county server and served **same-origin**, so every API call goes straight to
the platform's Kong gateway — no separate backend, no CORS.

**Live:** https://bometfeedbackhub.digit.org/voices/

## What's wired to real APIs

| Feature | Source API |
|---|---|
| Report a complaint (create) | PGR `POST /pgr-services/v2/request/_create` |
| My Tickets (list, comment, rate, reopen) | PGR `_search` / `_update` |
| Complaint categories (report picker + homepage "What you can report") | MDMS `RAINMAKER-PGR.ServiceDefs` |
| Wards (report, filters, preferences) | `boundary-service` ADMIN Ward + `localization` |
| Citizen sign-in | OTP: `/user-otp`, `/user/citizen/_create`, `/user/oauth/token` |
| Home & Data-page KPIs, charts, ward table | **PGR MV analytics API** `POST /pgr-services/v2/analytics/{catalog/_search,_query}` |
| All-time total | PGR `POST /pgr-services/v2/request/_count` |

The complete, live-verified API contract is documented in:
- [`BOMET_API_CONTRACT.md`](./BOMET_API_CONTRACT.md) — auth, PGR, MDMS, boundary, localization, filestore
- [`BOMET_ANALYTICS_MV_API.md`](./BOMET_ANALYTICS_MV_API.md) — the catalog-driven PGR MV analytics API + its 10 published KPIs

Tenancy: state/root tenant `ke`, city tenant `ke.bomet`.

## Architecture

```
Browser ── https://bometfeedbackhub.digit.org/voices/ (static SPA, nginx)
   │
   └── /pgr-services, /mdms-v2, /boundary-service, /user*, /localization, /filestore
        └── same-origin → Kong gateway → DIGIT services
```

API layer (`src/lib/`):
- `config.ts` — tenants, base URL (`""` = same-origin), basic-auth token, map center
- `http.ts` — `digitPost` / `digitForm` / `digitUpload` (attaches `RequestInfo`)
- `auth.ts` — citizen OTP session (`ensureSession`, `verifyAndLogin`, localStorage)
- `apiClient.ts` — PGR create/search/update, wards, service-defs (stable public interface)
- `digitMappers.ts` — pure PGR ⇄ `Story` mappers
- `analyticsApi.ts` — PGR MV analytics client (`queryKpi`, `getAnalyticsCatalog`, `getComplaintTotal`)

## Tech stack
Vite · React 18 · TypeScript · shadcn/ui (Radix) · Tailwind · React Router · TanStack Query · Recharts · Leaflet.

## Develop

```sh
npm install
npm run dev          # http://localhost:8080  (API calls need the live backend — see note)
npm run build        # -> dist/  (vite base = /voices/)
```

> Because the app calls the DIGIT APIs at absolute same-origin paths (`/pgr-services/...`), local
> `npm run dev` only shows live data if those paths are reachable/proxied to a DIGIT backend.
> The deployed build is served from the DIGIT origin, where they resolve directly.

## Deploy (Bomet)

```sh
./deploy-bomet.sh    # build → tar-over-ssh to egov-bomet:/var/www/voices → ensure nginx /voices/ location
```

## End-to-end tests (Playwright)

```sh
npm run test:e2e            # runs against the live deployment by default
npm run test:e2e:report     # open the HTML report
```

Config via env (see `playwright.config.ts`):

| Env | Purpose | Default |
|---|---|---|
| `VOICES_BASE_URL` | base URL under test | `https://bometfeedbackhub.digit.org/voices` |
| `VOICES_RESOLVE` | `host:ip` to map the domain to a private/VPC IP | — |
| `VOICES_ALLOW_WRITE` | `1` to run tests that create real data (register a citizen, file a complaint) | off |

```sh
# Example: run from a machine that reaches Bomet only over the VPC
VOICES_RESOLVE="bometfeedbackhub.digit.org:10.0.0.2" npm run test:e2e
```

Suites (`tests/`): `home` (real stats + live categories), `report` (wizard → live wards/categories,
opt-in full submit), `mytickets` (login gate + opt-in login), `data` (MV-backed KPIs/charts),
`preferences` (live wards + topics). Read-only tests never mutate the tenant.

---

_Originally scaffolded with Lovable; the mock data layer has been fully replaced with live DIGIT APIs._
