"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Account, Category } from "@/lib/db/schema"
import { TransactionForm } from "../transactions/transaction-form"

export function AddArchivedTransactionButton({
  accounts,
  categories,
}: {
  accounts: Account[]
  categories: Category[]
}) {
  const [open, setOpen] = useState(false)

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
        defaultArchived
      />
    </>
  )
}
