import type { ReactNode } from "react"
import Link from "next/link"
import { Menu, PiggyBank } from "lucide-react"

import { requireSession } from "@/lib/auth/session"
import { NavLinks } from "@/components/nav/nav-links"
import { ThemeToggle } from "@/components/nav/theme-toggle"
import { UserMenu } from "@/components/nav/user-menu"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

export default async function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireSession()

  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 font-semibold">
          <PiggyBank className="size-5" />
          Finance Tracker
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 font-semibold">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <PiggyBank className="size-5" />
                    Finance Tracker
                  </Link>
                </div>
                <div className="p-3">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu email={session.email} name={session.name} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
