import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, ArrowUpDown } from 'lucide-react';
import { KPI_DEFINITIONS } from '@/lib/serviceAnalyticsData';
import { KPI, toAnalyticsWindow } from '@/lib/analyticsApi';
import { prettifyBoundaryCode } from '@/lib/digitMappers';
import { useKpi } from '@/hooks/useKpi';
import { Button } from '@/components/ui/button';

interface StatusByBoundaryTableProps {
  timeRange: string;
}

interface WardRow {
  ward: string;
  filed: number;
  open: number;
  resolved: number;
  resolutionRate: number;
}

type SortField = keyof WardRow;
type SortDirection = 'asc' | 'desc';

export function StatusByBoundaryTable({ timeRange }: StatusByBoundaryTableProps) {
  const win = toAnalyticsWindow(timeRange);
  const { data, loading, error } = useKpi(KPI.wardMap, win);

  const [sortField, setSortField] = useState<SortField>('filed');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const rawData: WardRow[] = (data?.rows ?? []).map((r) => {
    const filed = Number(r.filed) || 0;
    const open = Number(r.open) || 0;
    const resolved = Number(r.resolved) || 0;
    return {
      ward: r.ward_code == null
        ? 'Unassigned'
        : prettifyBoundaryCode(String(r.ward_code)) || 'Unassigned',
      filed,
      open,
      resolved,
      resolutionRate: filed > 0 ? Math.round((resolved / filed) * 1000) / 10 : 0,
    };
  });

  const rows = [...rawData].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const ColumnHeader = ({ field, label, definition }: { field: SortField; label: string; definition?: string }) => (
    <TableHead className="text-xs">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-1"
        onClick={() => handleSort(field)}
      >
        {label}
        <ArrowUpDown className="w-3 h-3" />
        {definition && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-muted-foreground ml-1" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {definition}
            </TooltipContent>
          </Tooltip>
        )}
      </Button>
    </TableHead>
  );

  return (
    <Card className="ncc-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Complaint Status by Ward</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-sm">
              {KPI_DEFINITIONS.totalComplaints}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Failed to load data
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <Table aria-label="Complaint status breakdown by ward">
            <TableHeader>
              <TableRow>
                <ColumnHeader field="ward" label="Ward" />
                <ColumnHeader field="filed" label="Filed" definition={KPI_DEFINITIONS.totalComplaints} />
                <ColumnHeader field="open" label="Open" definition={KPI_DEFINITIONS.openComplaints} />
                <ColumnHeader field="resolved" label="Resolved" definition={KPI_DEFINITIONS.resolvedComplaints} />
                <ColumnHeader field="resolutionRate" label="Resolution %" definition={KPI_DEFINITIONS.completionRate} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.ward}>
                  <TableCell className="font-medium">{row.ward}</TableCell>
                  <TableCell className="font-semibold">{row.filed}</TableCell>
                  <TableCell>{row.open}</TableCell>
                  <TableCell>{row.resolved}</TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${
                        row.resolutionRate >= 70
                          ? 'text-success'
                          : row.resolutionRate >= 50
                          ? 'text-warning'
                          : 'text-destructive'
                      }`}
                    >
                      {row.resolutionRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
