import { requireSession } from "@/lib/auth/session"
import { getSettings } from "@/lib/finance/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "./profile-form"
import { CurrencyForm } from "./currency-form"

export default async function SettingsPage() {
  const session = await requireSession()
  const settings = await getSettings(session.uid)

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm initialName={session.name ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyForm initialCurrency={settings.currency} />
        </CardContent>
      </Card>
    </div>
  )
}
