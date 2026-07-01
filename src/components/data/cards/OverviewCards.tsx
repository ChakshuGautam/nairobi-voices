import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoTooltip } from '../ServiceAnalytics';
import { KPI_DEFINITIONS } from '@/lib/serviceAnalyticsData';
import { KPI, KpiQueryResult, toAnalyticsWindow } from '@/lib/analyticsApi';
import { useKpi } from '@/hooks/useKpi';

interface OverviewCardsProps {
  timeRange: string;
  // subCounty is retained for API compatibility with the filter bar but has no
  // published KPI equivalent, so it does not affect the fetched aggregates.
  subCounty?: string;
}

function firstNum(data: KpiQueryResult | null, column: string): number | null {
  const row = data?.rows?.[0];
  const v = row ? row[column] : undefined;
  return typeof v === 'number' ? v : null;
}

export function OverviewCards({ timeRange }: OverviewCardsProps) {
  const win = toAnalyticsWindow(timeRange);

  const created = useKpi(KPI.newCreated, win);
  const open = useKpi(KPI.openLive, win);
  const resolved = useKpi(KPI.resolved, win);
  const rate = useKpi(KPI.resolutionRate, win);

  const cards = [
    {
      label: 'New Complaints',
      state: created,
      value: firstNum(created.data, 'total'),
      format: (n: number) => n.toLocaleString(),
      definition: KPI_DEFINITIONS.totalComplaints,
    },
    {
      label: 'Open Complaints',
      state: open,
      value: firstNum(open.data, 'total'),
      format: (n: number) => n.toLocaleString(),
      definition: KPI_DEFINITIONS.openComplaints,
    },
    {
      label: 'Resolved',
      state: resolved,
      value: firstNum(resolved.data, 'total'),
      format: (n: number) => n.toLocaleString(),
      definition: KPI_DEFINITIONS.resolvedComplaints,
    },
    {
      label: 'Resolution Rate',
      state: rate,
      value: firstNum(rate.data, 'pct'),
      format: (n: number) => `${(n * 100).toFixed(1)}%`,
      definition: KPI_DEFINITIONS.completionRate,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="ncc-card">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <InfoTooltip definition={card.definition} />
              </div>
              {card.state.loading ? (
                <Skeleton className="h-9 w-24" />
              ) : card.state.error || card.value === null ? (
                <p className="text-3xl font-bold text-muted-foreground">—</p>
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {card.format(card.value)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
