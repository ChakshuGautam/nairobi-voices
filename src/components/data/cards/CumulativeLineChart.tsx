import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoTooltip } from '../ServiceAnalytics';
import { ChartContainer } from '../ChartContainer';
import { KPI_DEFINITIONS } from '@/lib/serviceAnalyticsData';
import { KPI, toAnalyticsWindow } from '@/lib/analyticsApi';
import { useKpi } from '@/hooks/useKpi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface CumulativeLineChartProps {
  timeRange: string;
}

export function CumulativeLineChart({ timeRange }: CumulativeLineChartProps) {
  const win = toAnalyticsWindow(timeRange);
  const { data, loading, error } = useKpi(KPI.overTimeDaily, win);

  const chartData = (data?.rows ?? []).map((row) => {
    const ts = Number(row.created_date);
    return {
      label: Number.isFinite(ts)
        ? new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : String(row.created_date ?? ''),
      created: Number(row.created) || 0,
      resolved: Number(row.resolved) || 0,
      on_time: Number(row.on_time) || 0,
    };
  });

  return (
    <Card className="ncc-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Complaints over Time (daily)</CardTitle>
          <InfoTooltip definition={KPI_DEFINITIONS.totalComplaints} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Failed to load data
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer
            height={300}
            ariaLabel="Line chart showing complaints created, resolved, and resolved on time per day"
          >
            {(width, height) => (
              <LineChart data={chartData} width={width} height={height} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))' }}
                />
                <Line
                  type="monotone"
                  dataKey="on_time"
                  name="Resolved On-time"
                  stroke="hsl(var(--info))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--info))' }}
                />
              </LineChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
