"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { monthLabel } from "@/lib/finance/utils"

const chartConfig = {
  income: { label: "Income", color: "var(--chart-2)" },
  expense: { label: "Expenses", color: "var(--chart-4)" },
} satisfies ChartConfig

export function TrendChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[]
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No data yet.
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data}>
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
        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
