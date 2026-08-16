import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getAdminAuth } from "@/lib/firebase/admin"
import { SESSION_COOKIE_NAME } from "@/lib/auth/session"

const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

export async function POST(request: NextRequest) {
  const { idToken } = await request.json()

  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 })
  }

  try {
    const adminAuth = getAdminAuth()
    await adminAuth.verifyIdToken(idToken)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    })
    return response
  } catch {
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 })
  }
}
