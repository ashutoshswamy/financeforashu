import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { SESSION_COOKIE_NAME } from "@/lib/auth/session"

// Optimistic check only — presence of the cookie, not its validity.
// Real verification happens server-side via getSession()/requireSession().
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)
  const { pathname } = request.nextUrl

  if (!hasSession && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
