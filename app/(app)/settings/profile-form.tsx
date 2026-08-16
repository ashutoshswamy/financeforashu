"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, updateProfile } from "firebase/auth"
import { toast } from "sonner"

import { auth } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user?.displayName) setName(user.displayName)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!auth.currentUser) return

    setSubmitting(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name })
      toast.success("Name updated")
    } catch {
      toast.error("Failed to update name")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}
