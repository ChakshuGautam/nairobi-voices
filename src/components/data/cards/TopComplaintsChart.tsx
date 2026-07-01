import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoTooltip } from '../ServiceAnalytics';
import { ChartContainer } from '../ChartContainer';
import { KPI_DEFINITIONS } from '@/lib/serviceAnalyticsData';
import { KPI, toAnalyticsWindow } from '@/lib/analyticsApi';
import { prettifyBoundaryCode } from '@/lib/digitMappers';
import { useKpi } from '@/hooks/useKpi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface TopComplaintsChartProps {
  timeRange: string;
}

const TOP_N = 12;

export function TopComplaintsChart({ timeRange }: TopComplaintsChartProps) {
  const win = toAnalyticsWindow(timeRange);
  const { data, loading, error } = useKpi(KPI.byType, win);

  const chartData = [...(data?.rows ?? [])]
    .map((row) => ({
      category: prettifyBoundaryCode(String(row.service_code ?? '')) || 'Unknown',
      count: Number(row.total) || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_N);

  return (
    <Card className="ncc-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Top Complaint Types</CardTitle>
          <InfoTooltip definition={KPI_DEFINITIONS.totalComplaints} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : error ? (
          <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
            Failed to load data
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer
            height={350}
            ariaLabel="Horizontal bar chart showing top complaint types by volume"
          >
            {(width, height) => (
              <BarChart
                data={chartData}
                width={width}
                height={height}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Complaints']}
                />
                <Bar
                  dataKey="count"
                  name="Complaints"
                  fill="hsl(var(--info))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
