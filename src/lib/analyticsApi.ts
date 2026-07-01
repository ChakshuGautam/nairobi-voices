// Client for the Bomet PGR MV (materialized-view) analytics API — the same
// catalog-driven KPI engine the DIGIT dashboards use. See BOMET_ANALYTICS_MV_API.md.
//
// Base: /pgr-services/v2/analytics  (same-origin on Bomet, via Kong).
// The published PUBLIC KPIs work unauthenticated; ad-hoc queries are forbidden
// without an employee token, so we only use the catalog's published KPI ids.

import { CITY_TENANT_ID } from './config';
import { digitPost } from './http';

const ANALYTICS_BASE = '/pgr-services/v2/analytics';

export type AnalyticsWindow = 'last_1d' | 'last_7d' | 'last_30d' | 'wtd' | 'mtd';

/** Published KPI ids (from catalog/_search). */
export const KPI = {
  newCreated: 'cl_new_created_count',
  openLive: 'cl_open_complaints_live',
  resolved: 'cl_resolved_date_range_count',
  resolutionRate: 'cl_resolution_rate_count',
  reopenRate: 'cl_reopen_rate_count',
  overTimeDaily: 'cl_chart_over_time_created_daily',
  byType: 'cl_chart_complaints_by_type',
  deptFlowRatio: 'cl_chart_department_flow_ratio',
  deptResolutionRate: 'cl_chart_department_resolution_rate',
  wardMap: 'cl_map_ward_wow_current',
} as const;

export interface KpiTileViz {
  kind: string;
  format?: string;
  title?: string;
  subtitle?: string;
  measureKeys?: string[];
  dimensionKey?: string;
  accent?: string;
  group?: string;
  [k: string]: unknown;
}
export interface KpiTile {
  kpiId: string;
  version?: string;
  titleKey?: string | null;
  viz: KpiTileViz;
  params?: Array<{ name: string; allowed?: string[]; default?: string }>;
}
export interface KpiQueryResult {
  asOf?: number;
  scope?: { tenantId: string; level: string };
  grain?: string;
  columns: string[];
  rows: Array<Record<string, number | string | null>>;
}

let catalogCache: KpiTile[] | null = null;
export async function getAnalyticsCatalog(): Promise<KpiTile[]> {
  if (catalogCache) return catalogCache;
  try {
    const res = await digitPost<{ tiles?: KpiTile[] }>(
      `${ANALYTICS_BASE}/catalog/_search`,
      { tenantId: CITY_TENANT_ID },
    );
    catalogCache = res.tiles ?? [];
  } catch {
    catalogCache = [];
  }
  return catalogCache;
}

const queryCache = new Map<string, Promise<KpiQueryResult>>();
/** Run a published KPI and return its {columns, rows} result (cached per kpi+window). */
export async function queryKpi(kpiId: string, window: AnalyticsWindow = 'last_30d'): Promise<KpiQueryResult> {
  const key = `${kpiId}|${window}`;
  if (!queryCache.has(key)) {
    const p = digitPost<KpiQueryResult>(`${ANALYTICS_BASE}/_query`, {
      tenantId: CITY_TENANT_ID,
      query: { kpiId, params: { window } },
    }).catch((e) => {
      queryCache.delete(key);
      throw e;
    });
    queryCache.set(key, p);
  }
  return queryCache.get(key)!;
}

/** Single scalar from a number-tile KPI (first row, first/named column). */
export async function kpiNumber(
  kpiId: string,
  window: AnalyticsWindow = 'last_30d',
  column?: string,
): Promise<number | null> {
  const r = await queryKpi(kpiId, window);
  const row = r.rows?.[0];
  if (!row) return null;
  const col = column ?? r.columns?.[0];
  const v = col ? row[col] : Object.values(row)[0];
  return typeof v === 'number' ? v : null;
}

/** All-time total complaints for the tenant (PGR _count — works unauthenticated). */
export async function getComplaintTotal(): Promise<number | null> {
  try {
    const res = await digitPost<{ count?: number }>(
      '/pgr-services/v2/request/_count',
      {},
      { query: { tenantId: CITY_TENANT_ID } },
    );
    return typeof res.count === 'number' ? res.count : null;
  } catch {
    return null;
  }
}

/** Map the app's time-range selector values to the KPI window vocabulary. */
export function toAnalyticsWindow(timeRange: string): AnalyticsWindow {
  switch (timeRange) {
    case '1day':
    case 'today':
      return 'last_1d';
    case '7days':
    case 'week':
      return 'last_7d';
    case 'mtd':
    case 'month':
      return 'mtd';
    case '30days':
    default:
      return 'last_30d';
  }
}
