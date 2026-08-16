"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { getSession } from "@/lib/auth/session"
import { CURRENCIES } from "@/lib/finance/utils"

const currencySchema = z.object({
  currency: z.enum(CURRENCIES),
})

export async function updateCurrency(input: unknown) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const data = currencySchema.parse(input)

  await db
    .insert(settings)
    .values({ userId: session.uid, currency: data.currency })
    .onConflictDoUpdate({
      target: settings.userId,
      set: { currency: data.currency },
    })

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  revalidatePath("/analytics")
}
