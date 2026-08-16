"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { accounts } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"

const accountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["cash", "bank", "credit", "investment"]),
  currency: z.string().min(1).max(10),
  initialBalance: z.coerce.number(),
})

export async function createAccount(input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = accountSchema.parse(input)
  await db.insert(accounts).values({ userId: session.uid, ...data })

  revalidatePath("/accounts")
  revalidatePath("/dashboard")
  revalidatePath("/transactions")
}

export async function updateAccount(id: string, input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = accountSchema.parse(input)
  await db
    .update(accounts)
    .set(data)
    .where(and(eq(accounts.id, id), eq(accounts.userId, session.uid)))

  revalidatePath("/accounts")
  revalidatePath("/dashboard")
}

export async function deleteAccount(id: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, session.uid)))

  revalidatePath("/accounts")
  revalidatePath("/dashboard")
}
