import { requireSession } from "@/lib/auth/session"
import { getAccounts, getCategories, getSettings, getTransactions } from "@/lib/finance/queries"
import { Card, CardContent } from "@/components/ui/card"
import { FiltersBar } from "./filters-bar"
import { TransactionTable } from "./transaction-table"
import { AddTransactionButton } from "./add-transaction-button"

export default async function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  const { uid } = await requireSession()
  const params = await searchParams
  const get = (key: string) => {
    const v = params[key]
    return typeof v === "string" ? v : undefined
  }

  const [accounts, categories, transactions, settings] = await Promise.all([
    getAccounts(uid),
    getCategories(uid),
    getTransactions(uid, {
      type: get("type") as "income" | "expense" | "transfer" | undefined,
      accountId: get("accountId"),
      categoryId: get("categoryId"),
      from: get("from"),
      to: get("to"),
    }),
    getSettings(uid),
  ])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <AddTransactionButton accounts={accounts} categories={categories} />
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6">
          <FiltersBar accounts={accounts} categories={categories} />
          <TransactionTable
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            currency={settings.currency}
          />
        </CardContent>
      </Card>
    </div>
  )
}
