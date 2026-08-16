"use client"

import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/finance/utils"
import { deleteBudget } from "./actions"

type BudgetRow = {
  categoryId: string
  categoryName: string
  color: string
  budgetAmount: number
  spent: number
}

export function BudgetList({
  budgets,
  currency = "USD",
}: {
  budgets: (BudgetRow & { id: string })[]
  currency?: string
}) {
  async function handleDelete(id: string) {
    try {
      await deleteBudget(id)
      toast.success("Budget removed")
    } catch {
      toast.error("Failed to remove")
    }
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No budgets set for this month.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map((b) => {
        const pct = Math.min(100, Math.round((b.spent / b.budgetAmount) * 100))
        const over = b.spent > b.budgetAmount
        return (
          <Card key={b.categoryId}>
            <CardContent className="grid gap-3 pt-6">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: b.color }}>
                  {b.categoryName}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleDelete(b.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <Progress
                value={pct}
                className={over ? "[&_[data-slot=progress-indicator]]:bg-chart-4" : undefined}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className={over ? "font-medium text-chart-4" : undefined}>
                  {formatCurrency(b.spent, currency)} spent
                </span>
                <span>of {formatCurrency(b.budgetAmount, currency)}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
