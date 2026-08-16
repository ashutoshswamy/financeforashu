"use server"

import { revalidatePath } from "next/cache"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"

const transactionSchema = z
  .object({
    accountId: z.string().uuid().optional().or(z.literal("")),
    toAccountId: z.string().uuid().optional().or(z.literal("")),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    type: z.enum(["income", "expense", "transfer"]),
    amount: z.coerce.number().positive(),
    description: z.string().min(1).max(200),
    date: z.string().optional().or(z.literal("")),
    notes: z.string().max(1000).optional().or(z.literal("")),
    archived: z.boolean().optional(),
  })
  .refine((data) => data.type !== "transfer" || !!data.accountId, {
    message: "accountId required for transfers",
    path: ["accountId"],
  })
  .refine((data) => data.type !== "transfer" || !!data.toAccountId, {
    message: "toAccountId required for transfers",
    path: ["toAccountId"],
  })
  .refine((data) => data.type !== "transfer" || data.toAccountId !== data.accountId, {
    message: "toAccountId must differ from accountId",
    path: ["toAccountId"],
  })

export async function createTransaction(input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = transactionSchema.parse(input)

  await db.insert(transactions).values({
    userId: session.uid,
    accountId: data.accountId || null,
    toAccountId: data.type === "transfer" ? data.toAccountId || null : null,
    categoryId: data.type === "transfer" ? null : data.categoryId || null,
    type: data.type,
    amount: data.amount,
    description: data.description,
    date: data.date || null,
    notes: data.notes || null,
    archived: data.archived ?? false,
  })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/analytics")
  revalidatePath("/archive")
}

export async function updateTransaction(id: string, input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = transactionSchema.parse(input)

  await db
    .update(transactions)
    .set({
      accountId: data.accountId || null,
      toAccountId: data.type === "transfer" ? data.toAccountId || null : null,
      categoryId: data.type === "transfer" ? null : data.categoryId || null,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date || null,
      notes: data.notes || null,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.uid)))

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/analytics")
  revalidatePath("/archive")
}

export async function deleteTransaction(id: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.uid)))

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/analytics")
  revalidatePath("/archive")
}

export async function setArchived(id: string, archived: boolean) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await db
    .update(transactions)
    .set({ archived })
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.uid)))

  revalidatePath("/transactions")
  revalidatePath("/archive")
}
