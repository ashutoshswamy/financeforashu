"use client"

import { useState } from "react"
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Account, Category } from "@/lib/db/schema"
import type { getTransactions } from "@/lib/finance/queries"
import { formatCurrency } from "@/lib/finance/utils"
import { TransactionForm } from "./transaction-form"
import { deleteTransaction, setArchived } from "./actions"

type Row = Awaited<ReturnType<typeof getTransactions>>[number]

export function TransactionTable({
  transactions,
  accounts,
  categories,
  currency = "USD",
}: {
  transactions: Row[]
  accounts: Account[]
  categories: Category[]
  currency?: string
}) {
  const [editing, setEditing] = useState<Row | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteTransaction(deleteId)
      toast.success("Transaction deleted")
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleteId(null)
    }
  }

  async function handleToggleArchive(t: Row) {
    try {
      await setArchived(t.id, !t.archived)
      toast.success(t.archived ? "Removed from archive" : "Added to archive")
    } catch {
      toast.error("Failed to update")
    }
  }

  if (transactions.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No transactions match your filters.
      </p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {t.date ?? "No date"}
                </TableCell>
                <TableCell className="max-w-52 truncate font-medium">
                  {t.description}
                  {t.archived && <Archive className="ml-1.5 inline size-3 text-muted-foreground" />}
                </TableCell>
                <TableCell>
                  {t.type === "transfer" ? (
                    <Badge variant="outline">Transfer</Badge>
                  ) : t.categoryName ? (
                    <Badge variant="outline" style={{ borderColor: t.categoryColor ?? undefined }}>
                      {t.categoryName}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.type === "transfer"
                    ? `${t.accountName} → ${t.toAccountName}`
                    : (t.accountName ?? "—")}
                </TableCell>
                <TableCell
                  className={
                    "text-right font-medium " +
                    (t.type === "income" ? "text-chart-2" : t.type === "expense" ? "text-chart-4" : "")
                  }
                >
                  {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                  {formatCurrency(t.amount, currency)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(t)
                          setEditOpen(true)
                        }}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleArchive(t)}>
                        {t.archived ? (
                          <>
                            <ArchiveRestore className="size-4" />
                            Unarchive
                          </>
                        ) : (
                          <>
                            <Archive className="size-4" />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransactionForm
        open={editOpen}
        onOpenChange={setEditOpen}
        accounts={accounts}
        categories={categories}
        transaction={editing}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
