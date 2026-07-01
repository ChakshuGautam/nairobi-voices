import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '../ServiceAnalytics';
import { ChartContainer } from '../ChartContainer';
import { getUniqueCitizensData, KPI_DEFINITIONS } from '@/lib/serviceAnalyticsData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface UniqueCitizensChartProps {
  timeRange: string;
}

export function UniqueCitizensChart({ timeRange }: UniqueCitizensChartProps) {
  const data = getUniqueCitizensData(timeRange);

  return (
    <Card className="ncc-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Unique Citizens Raising Complaints</CardTitle>
          <InfoTooltip definition={KPI_DEFINITIONS.uniqueCitizens} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          height={260} 
          ariaLabel="Line chart showing unique citizens over time"
        >
          {(width, height) => (
            <LineChart data={data} width={width} height={height} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [value.toLocaleString(), 'Citizens']}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Unique Citizens"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--secondary))' }}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
