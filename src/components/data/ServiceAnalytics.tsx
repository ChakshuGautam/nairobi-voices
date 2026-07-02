import React, { useState } from 'react';
import { Filter, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { OverviewCards } from './cards/OverviewCards';
import { CumulativeLineChart } from './cards/CumulativeLineChart';
import { ComplaintsByDepartmentPie } from './cards/ComplaintsByDepartmentPie';
import { TopComplaintsChart } from './cards/TopComplaintsChart';
import { StatusByBoundaryTable } from './cards/StatusByBoundaryTable';
import { MyComplaintsSummary } from './cards/MyComplaintsSummary';
import { TIME_RANGES } from '@/lib/serviceAnalyticsData';

export function ServiceAnalytics() {
  const [timeRange, setTimeRange] = useState('30days');

  return (
    <div className="space-y-6">
      {/* My Complaints Summary — backed by live PGR data
          (apiClient.getMyTickets over ke.bomet). */}
      <MyComplaintsSummary />

      {/* Aggregate Analytics Filter Bar */}
      <Card className="ncc-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filters:
            </div>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((tr) => (
                  <SelectItem key={tr.value} value={tr.value}>
                    {tr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Overview KPIs (real: cl_new_created / cl_open_complaints_live /
          cl_resolved_date_range / cl_resolution_rate) */}
      <OverviewCards timeRange={timeRange} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints over time — cl_chart_over_time_created_daily */}
        <CumulativeLineChart timeRange={timeRange} />

        {/* Complaints by department — cl_chart_department_flow_ratio */}
        <ComplaintsByDepartmentPie timeRange={timeRange} />
      </div>

      {/* Top complaint types — cl_chart_complaints_by_type */}
      <TopComplaintsChart timeRange={timeRange} />

      {/* Status by ward — cl_map_ward_wow_current */}
      <StatusByBoundaryTable timeRange={timeRange} />
    </div>
  );
}

// Reusable tooltip info icon
export function InfoTooltip({ definition }: { definition: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-muted transition-colors"
          aria-label="View definition"
        >
          <Info className="w-4 h-4 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        {definition}
      </TooltipContent>
    </Tooltip>
  );
}
