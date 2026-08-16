"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Category } from "@/lib/db/schema"
import { CategoryForm } from "./category-form"
import { deleteCategory } from "./actions"

export function CategoryList({ categories }: { categories: Category[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteCategory(deleteId)
      toast.success("Category deleted")
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleteId(null)
    }
  }

  const income = categories.filter((c) => c.type === "income")
  const expense = categories.filter((c) => c.type === "expense")

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Tags className="size-8" />
            No categories yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "Expense", items: expense },
            { label: "Income", items: income },
          ].map((group) => (
            <Card key={group.label}>
              <CardContent className="grid gap-2 pt-6">
                <h2 className="text-sm font-medium text-muted-foreground">{group.label}</h2>
                {group.items.length === 0 && (
                  <p className="text-sm text-muted-foreground">None yet.</p>
                )}
                {group.items.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Badge style={{ backgroundColor: c.color, color: "white" }}>{c.name}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(c)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryForm open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Transactions using this category keep their history but lose the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
