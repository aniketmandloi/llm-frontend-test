"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface TrendChartPoint {
  label: string;
  created: number;
  completed: number;
}

const CHART_CONFIG = {
  created: { label: "Created", color: "var(--chart-2)" },
  completed: { label: "Completed", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CompletionTrendChart({ data, height = 220 }: { data: readonly TrendChartPoint[]; height?: number }) {
  return (
    <ChartContainer config={CHART_CONFIG} className="w-full" style={{ height }}>
      <AreaChart data={[...data]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="completed"
          type="monotone"
          stroke="var(--color-completed)"
          fill="var(--color-completed)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Area
          dataKey="created"
          type="monotone"
          stroke="var(--color-created)"
          fill="transparent"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
