# Cleanup TODO — Lovable-generated code

Gap analysis of the original Lovable scaffold vs the hand-written DIGIT layer
(`src/lib/{config,http,auth,apiClient,digitMappers,analyticsApi}.ts`, `src/hooks/useKpi.ts` are the quality bar).
Baseline: single 1.41 MB JS chunk (401 KB gz), 20,968 src lines, `React.lazy` = 0 uses, `useQuery` = 0 uses.

API-wiring gaps are tracked separately as GitHub issues labeled `api-gap` (#1–#21). This file is code hygiene.

## 1. Dead code (delete outright)

- [ ] **1.1 Dead components (zero importers):** `src/components/tickets/TicketDetails.tsx` (221 lines, superseded by TicketDrawer), `src/components/map/NaivashaMap.tsx` (359), `src/components/story/NewStoryPanel.tsx` (392), `src/components/NavLink.tsx` (AppLayout imports react-router's NavLink, not this). ~1,000 lines. **S**
- [ ] **1.2 Six dead analytics cards:** `ComplaintsByStatusBar/Pie`, `ComplaintsBySourceChart`, `ComplaintsByChannelPie`, `UniqueCitizensChart`, `AverageSolutionTimeCard` under `src/components/data/cards/` — removed from render when the MV wiring landed; delete (re-add later per issue #12 with real KPIs). **S**
- [ ] **1.3 Shrink `src/lib/serviceAnalyticsData.ts` (308 lines):** after 1.2 the only live exports are `KPI_DEFINITIONS` + `SUB_COUNTIES/TIME_RANGES/CATEGORIES/SOURCES` (+ `getComplaintsByDepartment`, see 6.4). Delete the 9 dead mock getters + 8 dead interfaces; rename to `analyticsMeta.ts`. **S**
- [ ] **1.4 Delete 25 unused shadcn/ui components:** `alert-dialog, alert, aspect-ratio, avatar, breadcrumb, calendar, carousel, command, context-menu, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, resizable, separator, sidebar (637 lines), slider, switch, toggle, toggle-group, use-toast shim`. Tree-shaken from the bundle but maintenance noise; trivially re-addable via `components.json`. **S**
- [ ] **1.5 Uninstall ~20 dead npm deps:** `@hookform/resolvers`, `zod` (0 imports); `react-hook-form`, `embla-carousel-react`, `input-otp`, `react-resizable-panels`, `cmdk`, `react-day-picker` + 14 `@radix-ui/react-*` packages whose only importer is a dead ui wrapper. Keep: `vaul`, `next-themes`, `date-fns`, `recharts`, `sonner`, `lucide-react`, `leaflet`, `react-leaflet`. **S**
- [ ] **1.6 Dead placeholder + public remnants:** `apiClient.ts` `transcribeAudio()` stub (zero callers), `public/case-study-nairobi-citizen-platform.md` (Lovable marketing doc shipped to prod), `public/placeholder.svg`. **S**

## 2. Duplication

- [ ] **2.1 Two toast systems both mounted** (`App.tsx:23-24`): sonner (6 app importers) + shadcn toast (only `TrainingModule.tsx`). Migrate the one usage to sonner; delete `hooks/use-toast.ts`, `ui/{toast,toaster,use-toast}.tsx`; uninstall `@radix-ui/react-toast`. **S**
- [ ] **2.2 Merge hotspot survey modals:** `GarbageHotspotSurveyModal` (344 lines) vs `FloodHotspotSurveyModal` (306) are ~84% identical. Extract one `HotspotSurveyModal` parameterized by type; keep thin typed wrappers. **M**
- [ ] **2.3 react-query installed but never used:** `QueryClientProvider` in App.tsx, 0 `useQuery` calls, 13 hand-rolled `useEffect`-fetch files. Either adopt it (start inside `useKpi.ts`, signature unchanged) or uninstall it — half-installed is the worst state. **M/S**
- [ ] **2.5 Duplicate `CATEGORY_TO_DEPARTMENT`** (types/story.ts lower-case keys vs MyComplaintsSummary UPPER-CASE private copy) + `ChartContainer` name collision (`components/data/ChartContainer.tsx` vs `ui/chart.tsx`). Single source + rename. **S**

## 3. Naming / branding debt

- [ ] **3.1 Full rebrand inventory (L):** "Nairobi" in 24 src files; `index.html` title/meta + `lovable.dev` og-images; assets `nairobi-skyline.jpg`/`nairobi-city-county-logo.png`; `NairobiMap` component name; 934-line `nairobiAdminData.ts`; `NAIROBI_WARDS` sample data still consumed by live code (findWardByCoords, hotspot ward dropdowns). Make city name/logo/hero configurable in `config.ts`. Tracked user-facing side: issue #20.
- [ ] **3.2 Visible "Naivasha" strings (fix now, S):** `StoryFeed.tsx:66` "Recent reports and ideas from Naivasha" (live /stories page); `FloodHotspotSurveyModal.tsx:274` placeholder.
- [ ] **3.3 Storage-key namespaces (3 brands):** `voices.session` vs `nairobi_citizen_preferences` vs `nairobi_map_guide_seen`/`wardwise_map_guide_seen`. Standardize on `voices.*` with read-old/write-new migration. **S**
- [ ] **3.4 `source: 'NAIROBI_ENGAGEMENT'`** literal in `types/story.ts:60` (decorative; the real PGR source is `web`). Rename or drop. **S**

## 4. Types & strictness

- [ ] **4.1 Vestigial `Story.audioBlob`/`audioDuration`** (never assigned on a Story) + dead defensive branches in `StoryCard.tsx:34-48,148`. Note: `updates`/`attachments`/`satisfactionRating` ARE live — keep. **S**
      Related bug: `StorySubmission.beneficiary` is collected by a full UI section but never referenced by apiClient/digitMappers → silently dropped (tracked as issue #14).
- [ ] **4.2 `ISSUE_CATEGORIES` (6 Nairobi categories with invented serviceCodes)** still the icon/label source for ticket views while real MDMS codes exist. Re-scope as a pure presentation map; remove the fake-serviceCode fallback in `resolveServiceCode`. (User-facing side: issue #13.) **M**
- [ ] **4.3 `NAIROBI_WARDS` sample data lives in `types/story.ts`** — types file should be data-free; folds into 3.1.
- [ ] **4.4 Strictness staged re-enable:** `strict:false`, `noImplicitAny:false`, `noUnusedLocals:false` in tsconfig; `no-unused-vars: off` in eslint — exactly how the dead code accumulated. Stage: unused-vars warn → `noUnusedLocals` → `strictNullChecks` → full `strict`. **L (first step S)**

## 5. Bundle & performance

- [ ] **5.1 Route-level code splitting (biggest perf win):** 1.41 MB single chunk; App.tsx eagerly imports all 11 pages; leaflet (5 importers) + recharts (10) land in the entry chunk. `React.lazy` per route + `Suspense`; optional `manualChunks` for leaflet/recharts. **M**
- [ ] **5.2 Google Fonts loaded twice**, once render-blocking: `index.html:24` `<link>` AND `src/index.css:5` `@import` (different weight sets). Delete the `@import`, reconcile weights into the link. **S**
- [ ] **5.3 Lovable remnants in tooling:** `lovable-tagger` in vite.config + devDependencies (supply-chain dep); `package.json` name `vite_react_shadcn_ts@0.0.0`. Remove + set real name/version. **S**

## 6. Code smells

- [ ] **6.1 Oversized files:** `Report.tsx` 845 lines (extract beneficiary section :691-744, department-override :440-560, appreciation flow :233+; target <300), `TrainingModule.tsx` 664, `PolicyDetailModal.tsx` 579, `NairobiMap.tsx` 566, `LocationStep.tsx` 559, `AboutMyCity.tsx` 558. **M**
- [ ] **6.2 Fake delays / mock branches inside live flows:** `Report.tsx:238-240` appreciation `setTimeout(1000)` fake submit (issue #2); `happeningsApi.ts:440` fake 300 ms delay + `Math.random()`-shuffled fake landmarks (issues #4/#5). **M**
- [ ] **6.3 Console noise:** 28 `console.*` across src (ActiveSurveys 3, Report/MyTickets/NairobiMap/LocationStep/UserPreferencesModal/VoiceRecorder…). Keep deliberate error logs in the lib layer; delete debug logs; add eslint `no-console: ["warn", {allow:["error"]}]`. **S**
- [ ] **6.4 `MyComplaintsSummary` mixes live tickets with mock + `Math.random()` numbers** (issue #7). **M**
- [ ] **6.5 Pointless IIFE + magic timeouts:** `Index.tsx:122-138` IIFE around a static array; `setTimeout(…,100)` map-ready hack (`NairobiMap.tsx:326`), unnamed 500/300 ms timers (`MapGuide.tsx:15,21`, `MyTickets.tsx:98`). **S**
- [ ] **6.6 Mock-backed feature pages need a product decision:** Surveys / Policy / Training / AboutMyCity — wire, demo-label, or remove from nav (issues #9, #15, #16, #18). **L**

## 7. Testing

- [ ] **7.1 No unit tests.** `digitMappers.ts` (380 lines of pure PGR→Story transforms) is the ideal first target: vitest + recorded PGR fixtures from `BOMET_API_CONTRACT.md`; cover status mapping, SLA math, remarks→updates. Then `auth.normalizeKeMobile` and analyticsApi row parsing. **M**

## Suggested execution order (quick wins first)

1. 3.2 visible "Naivasha" strings (user-facing bug)
2. 1.1 + 1.2 + 1.4 + 1.6 delete dead files (~3,500 lines)
3. 1.5 + 5.3 uninstall dead deps, drop lovable-tagger, real package name
4. 1.3 shrink serviceAnalyticsData.ts
5. 5.2 de-dupe fonts
6. 2.1 one toast system
7. 2.5 + 6.5 + 6.3 small smells + eslint no-console
8. 3.3 + 3.4 storage keys / source constant
9. 5.1 route code-splitting
10. 2.3 react-query decision (adopt via useKpi, or remove)
11. 6.2 + 6.4 kill fake delays/randoms in live flows
12. 2.2 merge hotspot modals; 6.1 split Report.tsx
13. 4.2 ISSUE_CATEGORIES presentation map; 4.4 staged strictness
14. 7.1 vitest + digitMappers tests
15. 3.1 full rebrand + 6.6 mock-page product decisions
