import { requireSession } from "@/lib/auth/session"
import { getAccounts, getCategories, getSettings, getTransactions } from "@/lib/finance/queries"
import { formatCurrency } from "@/lib/finance/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionTable } from "../transactions/transaction-table"
import { AddArchivedTransactionButton } from "./add-archived-transaction-button"

export default async function ArchivePage() {
  const { uid } = await requireSession()

  const [accounts, categories, transactions, settings] = await Promise.all([
    getAccounts(uid),
    getCategories(uid),
    getTransactions(uid, { archived: true }, { limit: 200 }),
    getSettings(uid),
  ])

  const total = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
          <p className="text-sm text-muted-foreground">
            Important transactions you&apos;ve set aside for safekeeping.
          </p>
        </div>
        <AddArchivedTransactionButton accounts={accounts} categories={categories} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total archived
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(total, settings.currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Archived transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{transactions.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {transactions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing archived yet. Archive an existing transaction, or add one directly here.
            </p>
          ) : (
            <TransactionTable
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              currency={settings.currency}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
