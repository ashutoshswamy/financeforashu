import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Plus, Wallet } from "lucide-react"

import { requireSession } from "@/lib/auth/session"
import {
  getAccountsWithBalances,
  getMonthSummary,
  getMonthlyTrend,
  getRecentTransactions,
  getSettings,
} from "@/lib/finance/queries"
import { firstOfMonth, formatCurrency, monthsAgo } from "@/lib/finance/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendChart } from "./trend-chart"

export default async function DashboardPage() {
  const { uid } = await requireSession()

  const monthStart = firstOfMonth()
  const monthEnd = new Date().toISOString().slice(0, 10)

  const [accounts, summary, recent, trend, settings] = await Promise.all([
    getAccountsWithBalances(uid),
    getMonthSummary(uid, monthStart, monthEnd),
    getRecentTransactions(uid, 8),
    getMonthlyTrend(uid, monthsAgo(5)),
    getSettings(uid),
  ])
  const currency = settings.currency

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  const net = summary.income - summary.expense

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Button asChild size="sm">
          <Link href="/transactions?new=1">
            <Plus className="size-4" />
            Add transaction
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalBalance, currency)}</div>
            <p className="text-xs text-muted-foreground">{accounts.length} account(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-2xl font-semibold text-chart-2">
              <ArrowUpRight className="size-5" />
              {formatCurrency(summary.income, currency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-2xl font-semibold text-chart-4">
              <ArrowDownRight className="size-5" />
              {formatCurrency(summary.expense, currency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={net >= 0 ? "text-2xl font-semibold text-chart-2" : "text-2xl font-semibold text-chart-4"}>
              {formatCurrency(net, currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs. expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            )}
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <div className="flex items-center gap-1.5">
                    {t.type === "transfer" ? (
                      <Badge variant="outline" className="text-[10px]">
                        {t.accountName} → {t.toAccountName}
                      </Badge>
                    ) : (
                      t.categoryName && (
                        <Badge
                          variant="outline"
                          style={{ borderColor: t.categoryColor ?? undefined }}
                          className="text-[10px]"
                        >
                          {t.categoryName}
                        </Badge>
                      )
                    )}
                    <span className="text-xs text-muted-foreground">{t.date ?? "No date"}</span>
                  </div>
                </div>
                <span
                  className={
                    t.type === "income"
                      ? "shrink-0 text-sm font-medium text-chart-2"
                      : t.type === "expense"
                        ? "shrink-0 text-sm font-medium text-chart-4"
                        : "shrink-0 text-sm font-medium text-muted-foreground"
                  }
                >
                  {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                  {formatCurrency(t.amount, currency)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Wallet className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Add an account to start tracking your finances.
            </p>
            <Button asChild size="sm">
              <Link href="/accounts">Add account</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
