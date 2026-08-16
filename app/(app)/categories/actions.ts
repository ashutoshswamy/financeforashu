"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #6366f1"),
})

export async function createCategory(input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = categorySchema.parse(input)
  await db.insert(categories).values({ userId: session.uid, ...data })

  revalidatePath("/categories")
  revalidatePath("/transactions")
  revalidatePath("/budgets")
}

export async function updateCategory(id: string, input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = categorySchema.parse(input)
  await db
    .update(categories)
    .set(data)
    .where(and(eq(categories.id, id), eq(categories.userId, session.uid)))

  revalidatePath("/categories")
  revalidatePath("/transactions")
}

export async function deleteCategory(id: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, session.uid)))

  revalidatePath("/categories")
  revalidatePath("/transactions")
}
