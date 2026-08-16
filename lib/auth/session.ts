import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getAdminAuth } from "@/lib/firebase/admin"

export const SESSION_COOKIE_NAME = "session"

export async function getSession(): Promise<
  { uid: string; email: string | null; name: string | null } | null
> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    return { uid: decoded.uid, email: decoded.email ?? null, name: decoded.name ?? null }
  } catch {
    return null
  }
}

export async function requireSession() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}
