"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES } from "@/lib/finance/utils"
import { updateCurrency } from "./actions"

export function CurrencyForm({ initialCurrency }: { initialCurrency: string }) {
  const [currency, setCurrency] = useState(initialCurrency)
  const [submitting, setSubmitting] = useState(false)

  async function handleSave() {
    setSubmitting(true)
    try {
      await updateCurrency({ currency })
      toast.success("Currency updated")
    } catch {
      toast.error("Failed to update currency")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="currency">Default currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="currency" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Used for dashboard and analytics totals. Individual accounts keep their own currency.
        </p>
      </div>
      <Button onClick={handleSave} disabled={submitting} className="w-fit">
        {submitting ? "Saving..." : "Save"}
      </Button>
    </div>
  )
}
