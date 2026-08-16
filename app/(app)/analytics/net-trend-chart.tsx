"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { monthLabel } from "@/lib/finance/utils"

const chartConfig = {
  net: { label: "Net savings", color: "var(--chart-1)" },
} satisfies ChartConfig

export function NetTrendChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[]
}) {
  const series = data.map((d) => ({ month: d.month, net: d.income - d.expense }))

  if (series.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No data yet.
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <LineChart data={series}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => monthLabel(value)}
        />
        <ChartTooltip
          content={<ChartTooltipContent labelFormatter={(value) => monthLabel(String(value))} />}
        />
        <Line dataKey="net" stroke="var(--color-net)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}
