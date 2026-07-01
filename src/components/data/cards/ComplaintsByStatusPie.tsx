import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '../ServiceAnalytics';
import { ChartContainer } from '../ChartContainer';
import { getComplaintsByStatus, KPI_DEFINITIONS } from '@/lib/serviceAnalyticsData';
import { Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

// Status definitions for legend tooltips
const STATUS_DEFINITIONS: Record<string, string> = {
  'Open': 'Complaints filed by citizens awaiting further action (assignment).',
  'Assigned': 'Complaints assigned to an individual in the respective department.',
  'In Progress': 'Complaints currently being worked on by assigned staff.',
  'Resolved': 'Complaints marked as done by last-mile employee, awaiting citizen feedback.',
  'Reopened': 'Complaints reopened by citizen due to unsuccessful resolution earlier.',
  'Rejected': 'Complaints terminated by officer; citizens must file a new complaint.',
  'Reassign Requested': 'Complaints for which reassignment has been requested by last-mile employee.',
};

export function ComplaintsByStatusPie() {
  // Filter out "Closed" status to show only open complaints
  const data = getComplaintsByStatus().filter(item => item.status !== 'Closed');

  return (
    <Card className="ncc-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Open Complaints by Status</CardTitle>
          <InfoTooltip definition="Distribution of complaints that are still open (not yet closed). Excludes closed complaints." />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          height={280} 
          ariaLabel="Pie chart showing open complaint distribution by status"
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
                nameKey="status"
                label={({ status, percent }) =>
                  `${status}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
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
              />
            </PieChart>
          )}
        </ChartContainer>
        {/* Custom Legend with Info Icons */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
          {data.map((entry) => (
            <div key={entry.status} className="flex items-center gap-1.5">
              <span 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-foreground">{entry.status}</span>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  {STATUS_DEFINITIONS[entry.status] || entry.status}
                </TooltipContent>
              </UITooltip>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
