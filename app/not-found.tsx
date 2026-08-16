import Link from "next/link"
import { PiggyBank } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <PiggyBank className="size-10 text-muted-foreground" />
      <div className="grid gap-1">
        <h1 className="text-4xl font-semibold tracking-tight">404</h1>
        <p className="text-muted-foreground">This page doesn&apos;t exist.</p>
      </div>
      <Button asChild size="sm">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
