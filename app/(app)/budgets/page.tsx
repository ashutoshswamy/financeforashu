import { requireSession } from "@/lib/auth/session"
import { getBudgetProgress, getCategories, getSettings } from "@/lib/finance/queries"
import { firstOfMonth } from "@/lib/finance/utils"
import { BudgetForm } from "./budget-form"
import { BudgetList } from "./budget-list"
import { MonthSwitcher } from "./month-switcher"

export default async function BudgetsPage({
  searchParams,
}: PageProps<"/budgets">) {
  const { uid } = await requireSession()
  const params = await searchParams
  const monthParam = params.month
  const month =
    typeof monthParam === "string" ? monthParam : firstOfMonth()

  const [budgets, categories, settings] = await Promise.all([
    getBudgetProgress(uid, month),
    getCategories(uid, "expense"),
    getSettings(uid),
  ])

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
        <div className="flex items-center gap-3">
          <MonthSwitcher month={month} />
          <BudgetForm categories={categories} month={month} />
        </div>
      </div>

      <BudgetList budgets={budgets} currency={settings.currency} />
    </div>
  )
}
