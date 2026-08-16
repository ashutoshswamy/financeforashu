"use client"

import { Cell, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/finance/utils"

export function CategoryPieChart({
  data,
  currency = "USD",
}: {
  data: { categoryId: string; name: string; color: string; total: number }[]
  currency?: string
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No expenses this month.
      </div>
    )
  }

  const chartConfig = Object.fromEntries(
    data.map((d) => [d.categoryId, { label: d.name, color: d.color }])
  ) satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-64">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
              nameKey="categoryId"
            />
          }
        />
        <Pie data={data} dataKey="total" nameKey="categoryId" innerRadius={55} outerRadius={90}>
          {data.map((d) => (
            <Cell key={d.categoryId} fill={d.color} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="categoryId" />} />
      </PieChart>
    </ChartContainer>
  )
}
