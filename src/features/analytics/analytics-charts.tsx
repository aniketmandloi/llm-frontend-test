"use client";

import { Bar, BarChart, Cell, Pie, PieChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PRIORITY_META, STATUS_META } from "@/domain/meta";
import type { PriorityCount, ProjectProgressPoint, StatusCount } from "@/domain/analytics";
import { TONE_HEX } from "@/components/common/tone";
import type { TaskPriority, TaskStatus } from "@/domain/types";

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  urgent: "var(--chart-4)",
  high: "var(--chart-3)",
  medium: "var(--chart-1)",
  low: "var(--chart-2)",
  none: "var(--muted-foreground)",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  backlog: "var(--muted-foreground)",
  todo: "var(--chart-1)",
  in_progress: "var(--chart-3)",
  in_review: "var(--chart-5)",
  done: "var(--chart-2)",
};

const COUNT_CONFIG = {
  count: { label: "Tasks", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function PriorityChart({ data }: { data: readonly PriorityCount[] }) {
  const rows = data.map((item) => ({ label: PRIORITY_META[item.priority].label, count: item.count, color: PRIORITY_COLOR[item.priority] }));
  return (
    <ChartContainer config={COUNT_CONFIG} className="h-56 w-full">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {rows.map((row) => (
            <Cell key={row.label} fill={row.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function StatusDonut({ data }: { data: readonly StatusCount[] }) {
  const rows = data.map((item) => ({ name: STATUS_META[item.status].label, value: item.count, color: STATUS_COLOR[item.status] }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const config = {
    value: { label: "Tasks", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ChartContainer config={config} className="mx-auto h-48 w-48 shrink-0">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} strokeWidth={2} paddingAngle={2}>
            {rows.map((row) => (
              <Cell key={row.name} fill={row.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="grid flex-1 gap-2 text-sm">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-2.5 rounded-sm" style={{ backgroundColor: row.color }} />
              {row.name}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {row.value}
              <span className="ml-1.5 text-xs">{total === 0 ? "" : `${Math.round((row.value / total) * 100)}%`}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectProgressChart({ data }: { data: readonly ProjectProgressPoint[] }) {
  const rows = data.map((item) => ({ name: item.name, percent: item.percent, color: TONE_HEX[item.tone], done: item.done, total: item.total }));
  const config = {
    percent: { label: "Complete", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="w-full" style={{ height: Math.max(180, rows.length * 44) }}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="name" width={170} tickLine={false} axisLine={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="percent" name="Complete" radius={[0, 4, 4, 0]} maxBarSize={20} unit="%">
          {rows.map((row) => (
            <Cell key={row.name} fill={row.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
