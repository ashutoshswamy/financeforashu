"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Account, Category } from "@/lib/db/schema"
import { TransactionForm } from "./transaction-form"

export function AddTransactionButton({
  accounts,
  categories,
}: {
  accounts: Account[]
  categories: Category[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(() => searchParams.get("new") === "1")

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace("/transactions")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add transaction
      </Button>
      <TransactionForm
        open={open}
        onOpenChange={setOpen}
        accounts={accounts}
        categories={categories}
      />
    </>
  )
}
