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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface ComplaintsByDepartmentPieProps {
  timeRange: string;
}

const PALETTE = [
  'hsl(145, 70%, 35%)',
  'hsl(205, 85%, 45%)',
  'hsl(38, 95%, 50%)',
  'hsl(270, 60%, 50%)',
  'hsl(0, 75%, 50%)',
  'hsl(190, 65%, 28%)',
  'hsl(30, 90%, 55%)',
  'hsl(145, 75%, 40%)',
];

export function ComplaintsByDepartmentPie({ timeRange }: ComplaintsByDepartmentPieProps) {
  const win = toAnalyticsWindow(timeRange);
  // deptFlowRatio gives filed/resolved counts per department; we chart the
  // filed count as the department breakdown.
  const { data, loading, error } = useKpi(KPI.deptFlowRatio, win);

  const chartData = (data?.rows ?? [])
    .map((r, i) => ({
      department: r.department_code == null
        ? 'Unassigned'
        : prettifyBoundaryCode(String(r.department_code)) || 'Unassigned',
      count: Number(r.filed) || 0,
      color: PALETTE[i % PALETTE.length],
    }))
    .filter((d) => d.count > 0);

  return (
    <Card className="ncc-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Complaints by Department</CardTitle>
          <InfoTooltip definition={KPI_DEFINITIONS.complaintsByDepartment} />
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
            ariaLabel="Pie chart showing complaints by department"
          >
            {(width, height) => (
              <PieChart width={width} height={height}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="department"
                >
                  {chartData.map((entry, index) => (
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
        )}
      </CardContent>
    </Card>
  );
}
