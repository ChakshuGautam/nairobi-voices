# Bomet PGR MV (materialized-view) Analytics API — verified live 2026-07-01

The catalog-driven analytics API that the Bomet dashboards use. Backed by Postgres materialized
views (`pgr_mv_kpi`, `pgr_mv_dimension`, `pgr_mv_monthly`, `pgr_mv_monthly_source`, `complaint_facts`).
Same-origin on Bomet (`/pgr-services/v2/analytics/...` via Kong). **Works unauthenticated** for the
published PUBLIC KPIs (custom ad-hoc `_query` is `kpi_forbidden` without an employee token).

Base: `/pgr-services/v2/analytics`

## Endpoints (all POST, JSON)
- `POST /_schema` — `{RequestInfo, tenantId}` → `{aggFns, filterOps, windows, timeBuckets, grains{facts{timeRoles,dimensions[...]}}}`.
  Dimensions include: service_code, application_status, source, ward_code, zone_code, boundary_path,
  service_group, department_code, aging_bucket, sla_status_bucket, is_open, is_resolved, is_reopened, created_date…
- `POST /catalog/_search` — `{RequestInfo, tenantId}` → `{tiles:[KpiTile], total}`. The published KPI definitions + viz specs.
- `POST /packs` — `{RequestInfo, tenantId}` → `{tiles:[...]}`. Predefined dashboard-pack layouts.
- `POST /_query` — `{RequestInfo, tenantId, query:{kpiId, params:{window}}}` → `{asOf, scope{tenantId,level}, grain, columns:[...], rows:[{...}]}`.
  Windows for the tiles: `last_1d, last_7d, last_30d, wtd, mtd` (default `last_7d`).

## The 10 published PUBLIC KPIs (kpiId → viz → query result)
| kpiId | viz kind | _query result (columns → rows) |
|-------|----------|--------------------------------|
| `cl_new_created_count` | number-tile-sparkline | `[total]` → `{total: 61}` |
| `cl_open_complaints_live` | number-tile-sparkline | `[total]` → `{total: 70}` |
| `cl_resolved_date_range_count` | number-tile-sparkline | `[total]` → `{total: 2}` |
| `cl_resolution_rate_count` | number-tile-sparkline | `[pct]` → `{pct: 0.0328}` (0–1) |
| `cl_reopen_rate_count` | number-tile-delta | `[pct]` → `{pct: 0.0}` |
| `cl_chart_over_time_created_daily` | line | `[created_date, created, resolved, on_time]` → rows/day (created_date = epoch ms) |
| `cl_chart_complaints_by_type` | stacked-bar | `[service_code, total]` → rows |
| `cl_chart_department_flow_ratio` | horizontal-bar | `[department_code, filed, resolved]` |
| `cl_chart_department_resolution_rate` | bar | `[department_code, rate]` (0–1) |
| `cl_map_ward_wow_current` | map | `[ward_code, filed, open, resolved]` |

## Notes
- `pct`/`rate` are fractions (0–1) — multiply by 100 for display.
- `created_date` / time columns are epoch milliseconds.
- `ward_code`/`department_code` can be `null` (unmapped) — filter or label "Unassigned".
- No published KPI for average-resolution-time or by-status/by-source distribution (those need an employee token via ad-hoc `_query`, or read `pgr_mv_kpi.avg_resolution_days` server-side).
- nginx also exposes `/api/analytics/` → `pgr-services/v2/analytics/` behind basic auth (dashboard use); the SPA calls the same-origin `/pgr-services/v2/analytics/` path directly (no basic auth needed for published KPIs).

## MV columns (ground truth, DB `egov`)
- `pgr_mv_kpi`: tenantid, total, closed, completion_rate, avg_resolution_days, unique_citizens
- `pgr_mv_dimension`: tenantid, dimension, dim_value, total, closed, open_count, avg_resolution_days, completion_rate
- `pgr_mv_monthly`: tenantid, month_label, month_date, total, closed, open_count, unique_citizens
- `pgr_mv_monthly_source`: tenantid, month_label, month_date, source, total
