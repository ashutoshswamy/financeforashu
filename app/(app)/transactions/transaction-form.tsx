"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Account, Category, Transaction } from "@/lib/db/schema"
import { createTransaction, updateTransaction } from "./actions"

type EditableTransaction = Pick<
  Transaction,
  | "id"
  | "accountId"
  | "toAccountId"
  | "categoryId"
  | "type"
  | "amount"
  | "description"
  | "date"
  | "notes"
  | "archived"
>

const formSchema = z
  .object({
    accountId: z.string().optional(),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(["income", "expense", "transfer"]),
    amount: z.coerce.number().positive("Must be greater than 0"),
    description: z.string().min(1, "Required").max(200),
    date: z.string().optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => data.type !== "transfer" || !!data.accountId, {
    message: "Required",
    path: ["accountId"],
  })
  .refine((data) => data.type !== "transfer" || !!data.toAccountId, {
    message: "Required",
    path: ["toAccountId"],
  })
  .refine((data) => data.type !== "transfer" || data.toAccountId !== data.accountId, {
    message: "Must differ from the source account",
    path: ["toAccountId"],
  })

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

export function TransactionForm({
  open,
  onOpenChange,
  accounts,
  categories,
  transaction,
  defaultArchived = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  categories: Category[]
  transaction?: EditableTransaction | null
  defaultArchived?: boolean
}) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: "",
      toAccountId: "",
      categoryId: "",
      type: "expense",
      amount: 0,
      description: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  })

  const type = form.watch("type")
  const accountId = form.watch("accountId")
  const dateRequired = !defaultArchived && !transaction?.archived
  const accountRequired = type === "transfer" || (!defaultArchived && !transaction?.archived)

  useEffect(() => {
    if (!open) return
    form.reset(
      transaction
        ? {
            accountId: transaction.accountId ?? "",
            toAccountId: transaction.toAccountId ?? "",
            categoryId: transaction.categoryId ?? "",
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date ?? "",
            notes: transaction.notes ?? "",
          }
        : {
            accountId: defaultArchived ? "" : accounts[0]?.id ?? "",
            toAccountId: "",
            categoryId: "",
            type: "expense",
            amount: 0,
            description: "",
            date: defaultArchived ? "" : new Date().toISOString().slice(0, 10),
            notes: "",
          }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction])

  const filteredCategories = categories.filter((c) => c.type === type)
  const toAccountOptions = accounts.filter((a) => a.id !== accountId)

  async function onSubmit(values: FormValues) {
    if (dateRequired && !values.date) {
      form.setError("date", { message: "Required" })
      return
    }
    if (accountRequired && !values.accountId) {
      form.setError("accountId", { message: "Required" })
      return
    }

    setSubmitting(true)
    try {
      if (transaction) {
        await updateTransaction(transaction.id, values)
        toast.success("Transaction updated")
      } else {
        await createTransaction({ ...values, archived: defaultArchived })
        toast.success(defaultArchived ? "Transaction added to archive" : "Transaction added")
      }
      onOpenChange(false)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit transaction" : "Add transaction"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} value={field.value as number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries, rent, salary..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === "transfer"
                        ? "From account"
                        : accountRequired
                          ? "Account"
                          : "Account (optional)"}
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={accountRequired ? "Select account" : "None"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {type === "transfer" ? (
                <FormField
                  control={form.control}
                  name="toAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To account</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {toAccountOptions.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dateRequired ? "Date" : "Date (optional)"}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
