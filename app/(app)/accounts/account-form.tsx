"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import type { Account } from "@/lib/db/schema"
import { createAccount, updateAccount } from "./actions"

type EditableAccount = Pick<Account, "id" | "name" | "type" | "currency" | "initialBalance">


const formSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  type: z.enum(["cash", "bank", "credit", "investment"]),
  currency: z.string().min(1, "Required").max(10),
  initialBalance: z.coerce.number(),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

export function AccountForm({
  open,
  onOpenChange,
  account,
  defaultCurrency = "USD",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: EditableAccount | null
  defaultCurrency?: string
}) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "bank",
      currency: defaultCurrency,
      initialBalance: 0,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      account
        ? {
            name: account.name,
            type: account.type,
            currency: account.currency,
            initialBalance: account.initialBalance,
          }
        : { name: "", type: "bank", currency: defaultCurrency, initialBalance: 0 }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account])

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      if (account) {
        await updateAccount(account.id, values)
        toast.success("Account updated")
      } else {
        await createAccount(values)
        toast.success("Account added")
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
          <DialogTitle>{account ? "Edit account" : "Add account"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Checking, Savings, Visa..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting balance</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value as number} />
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
