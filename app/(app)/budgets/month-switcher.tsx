"use client"

import { useRouter, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { monthLabel } from "@/lib/finance/utils"

export function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter()
  const pathname = usePathname()

  function shift(delta: number) {
    const d = new Date(`${month}T00:00:00`)
    d.setMonth(d.getMonth() + delta)
    router.push(`${pathname}?month=${d.toISOString().slice(0, 10)}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => shift(-1)}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="w-32 text-center text-sm font-medium">{monthLabel(month)}</span>
      <Button variant="outline" size="icon" onClick={() => shift(1)}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
