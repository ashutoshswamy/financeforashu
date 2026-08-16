import { requireSession } from "@/lib/auth/session"
import {
  getBudgetProgress,
  getMonthSummary,
  getMonthlyTrend,
  getSettings,
  getSpendingByCategory,
} from "@/lib/finance/queries"
import { firstOfMonth, formatCurrency, monthsAgo } from "@/lib/finance/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendChart } from "../dashboard/trend-chart"
import { CategoryPieChart } from "./category-pie-chart"
import { NetTrendChart } from "./net-trend-chart"
import { TopCategoriesChart } from "./top-categories-chart"

export default async function AnalyticsPage() {
  const { uid } = await requireSession()

  const monthStart = firstOfMonth()
  const monthEnd = new Date().toISOString().slice(0, 10)
  const twelveMonthsAgo = monthsAgo(11)
  const sixMonthsAgo = monthsAgo(5)

  const [summary, trend, spendingThisMonth, topCategories, budgets, settings] = await Promise.all([
    getMonthSummary(uid, monthStart, monthEnd),
    getMonthlyTrend(uid, twelveMonthsAgo),
    getSpendingByCategory(uid, monthStart, monthEnd),
    getSpendingByCategory(uid, sixMonthsAgo, monthEnd),
    getBudgetProgress(uid, monthStart),
    getSettings(uid),
  ])
  const currency = settings.currency

  const savingsRate = summary.income > 0 ? ((summary.income - summary.expense) / summary.income) * 100 : 0

  const avgIncome = trend.length ? trend.reduce((s, t) => s + t.income, 0) / trend.length : 0
  const avgExpense = trend.length ? trend.reduce((s, t) => s + t.expense, 0) / trend.length : 0

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Savings rate (this month)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {savingsRate.toFixed(1)}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. monthly income
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(avgIncome, currency)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. monthly expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(avgExpense, currency)}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by category (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={spendingThisMonth} currency={currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top categories (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <TopCategoriesChart data={topCategories} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income vs. expenses (12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Net savings trend (12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <NetTrendChart data={trend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs. actual (this month)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.length === 0 && (
            <p className="text-sm text-muted-foreground">No budgets set for this month.</p>
          )}
          {budgets.map((b) => {
            const pct = Math.min(100, Math.round((b.spent / b.budgetAmount) * 100))
            const over = b.spent > b.budgetAmount
            return (
              <div key={b.categoryId} className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: b.color }}>
                    {b.categoryName}
                  </span>
                  <span className={over ? "text-chart-4" : "text-muted-foreground"}>
                    {formatCurrency(b.spent, currency)} / {formatCurrency(b.budgetAmount, currency)}
                  </span>
                </div>
                <Progress
                  value={pct}
                  className={over ? "[&_[data-slot=progress-indicator]]:bg-chart-4" : undefined}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
