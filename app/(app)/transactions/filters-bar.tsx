"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Account, Category } from "@/lib/db/schema"

export function FiltersBar({
  accounts,
  categories,
}: {
  accounts: Account[]
  categories: Category[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(v) => setParam("type", v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("accountId") ?? "all"}
        onValueChange={(v) => setParam("accountId", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("categoryId") ?? "all"}
        onValueChange={(v) => setParam("categoryId", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-36"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => setParam("from", e.target.value)}
      />
      <Input
        type="date"
        className="w-36"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => setParam("to", e.target.value)}
      />

      {searchParams.toString() && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          Clear
        </Button>
      )}
    </div>
  )
}
