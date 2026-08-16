import { requireSession } from "@/lib/auth/session"
import { getAccountsWithBalances, getSettings } from "@/lib/finance/queries"
import { AccountList } from "./account-list"

export default async function AccountsPage() {
  const { uid } = await requireSession()
  const [accounts, settings] = await Promise.all([
    getAccountsWithBalances(uid),
    getSettings(uid),
  ])

  return <AccountList accounts={accounts} defaultCurrency={settings.currency} />
}
