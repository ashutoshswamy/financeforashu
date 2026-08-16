"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { budgets } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"

const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  month: z.string().min(1),
  amount: z.coerce.number().positive(),
})

export async function upsertBudget(input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = budgetSchema.parse(input)

  await db
    .insert(budgets)
    .values({ userId: session.uid, ...data })
    .onConflictDoUpdate({
      target: [budgets.userId, budgets.categoryId, budgets.month],
      set: { amount: data.amount },
    })

  revalidatePath("/budgets")
}

export async function deleteBudget(id: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, session.uid)))

  revalidatePath("/budgets")
}
