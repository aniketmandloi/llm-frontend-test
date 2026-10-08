"use client";

import { useMemo, useState } from "react";
import { CompletionTrendChart } from "@/components/charts/completion-trend-chart";
import { PageHeader } from "@/components/common/page-header";
import { StatTile } from "@/components/common/stat-tile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WORKSPACE_TODAY } from "@/data/clock";
import {
  DATE_RANGE_META,
  DATE_RANGES,
  completionTrend,
  priorityDistribution,
  productivitySummary,
  projectProgressSeries,
  statusDistribution,
  type DateRange,
} from "@/domain/analytics";
import { liveTasks } from "@/domain/stats";
import { formatCalendarDate } from "@/lib/format";
import { asOption } from "@/lib/options";
import { useWorkspaceState } from "@/store/workspace-store";
import { PriorityChart, ProjectProgressChart, StatusDonut } from "./analytics-charts";

export function AnalyticsView() {
  const { tasks, projects } = useWorkspaceState();
  const [range, setRange] = useState<DateRange>("30d");

  const scoped = useMemo(() => liveTasks(tasks, projects), [tasks, projects]);

  const trend = useMemo(
    () =>
      completionTrend(scoped, range, WORKSPACE_TODAY).map((point) => ({
        label: formatCalendarDate(point.start),
        created: point.created,
        completed: point.completed,
      })),
    [scoped, range],
  );
  const summary = useMemo(
    () => productivitySummary(tasks, projects, range, WORKSPACE_TODAY),
    [tasks, projects, range],
  );
  const priorities = useMemo(() => priorityDistribution(tasks, projects), [tasks, projects]);
  const statuses = useMemo(() => statusDistribution(tasks, projects), [tasks, projects]);
  const progress = useMemo(() => projectProgressSeries(tasks, projects), [tasks, projects]);

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Throughput, cycle time and where the work sits. Figures cover live projects only."
        actions={
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={range}
            onValueChange={(next) => {
              const option = asOption(DATE_RANGES, next);
              if (option) setRange(option);
            }}
            aria-label="Date range"
          >
            {DATE_RANGES.map((option) => (
              <ToggleGroupItem key={option} value={option} className="px-3 text-xs">
                {DATE_RANGE_META[option].label.replace("Last ", "")}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />

      <section aria-label="Productivity overview" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Created" value={summary.created} hint={DATE_RANGE_META[range].label} />
        <StatTile label="Completed" value={summary.completed} hint={DATE_RANGE_META[range].label} />
        <StatTile
          label="Avg. cycle time"
          value={summary.averageCycleDays === null ? "—" : `${summary.averageCycleDays}d`}
          hint="Created to done"
        />
        <StatTile
          label="On time"
          value={summary.onTimeRate === null ? "—" : `${summary.onTimeRate}%`}
          hint="Done by the due date"
        />
        <StatTile label="Overdue now" value={summary.overdue} emphasis={summary.overdue > 0} hint="Open and past due" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Task completion trend</CardTitle>
          <CardDescription>
            {range === "90d" ? "Weekly buckets." : "Daily buckets."} Dashed line shows tasks created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompletionTrendChart data={trend} height={260} />
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Priority distribution</CardTitle>
            <CardDescription>All live tasks by priority.</CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityChart data={priorities} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
            <CardDescription>Where live tasks sit in the workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonut data={statuses} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project progress</CardTitle>
          <CardDescription>Share of tasks done in each live project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectProgressChart data={progress} />
        </CardContent>
      </Card>
    </div>
  );
}
