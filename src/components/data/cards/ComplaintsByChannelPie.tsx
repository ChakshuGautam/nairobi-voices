import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '../ServiceAnalytics';
import { ChartContainer } from '../ChartContainer';
import { getComplaintsByChannel, KPI_DEFINITIONS } from '@/lib/serviceAnalyticsData';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export function ComplaintsByChannelPie() {
  const data = getComplaintsByChannel();

  return (
    <Card className="ncc-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Complaints by Channel</CardTitle>
          <InfoTooltip definition={KPI_DEFINITIONS.complaintsByChannel} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          height={300} 
          ariaLabel="Pie chart showing complaints by channel"
        >
          {(width, height) => (
            <PieChart width={width} height={height}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="channel"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
