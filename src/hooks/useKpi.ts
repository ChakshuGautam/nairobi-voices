import { useEffect, useState } from 'react';
import { AnalyticsWindow, KpiQueryResult, queryKpi } from '@/lib/analyticsApi';

/** Load a single published KPI's {columns, rows} for the given window. */
export function useKpi(kpiId: string | null, window: AnalyticsWindow = 'last_30d') {
  const [data, setData] = useState<KpiQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!kpiId) {
      setData(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    queryKpi(kpiId, window)
      .then((r) => alive && (setData(r), setLoading(false)))
      .catch((e) => alive && (setError(String(e?.message || e)), setLoading(false)));
    return () => {
      alive = false;
    };
  }, [kpiId, window]);

  return { data, loading, error };
}
