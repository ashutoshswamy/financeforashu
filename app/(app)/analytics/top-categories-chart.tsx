"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/finance/utils"

const chartConfig = {
  total: { label: "Spent", color: "var(--chart-3)" },
} satisfies ChartConfig

export function TopCategoriesChart({
  data,
  currency = "USD",
}: {
  data: { categoryId: string; name: string; color: string; total: number }[]
  currency?: string
}) {
  const top = data.slice(0, 6)

  if (top.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No expenses yet.
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={top} layout="vertical" margin={{ left: 12 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value), currency)} />}
        />
        <Bar dataKey="total" radius={4}>
          {top.map((d) => (
            <Cell key={d.categoryId} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
