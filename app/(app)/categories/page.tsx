import { requireSession } from "@/lib/auth/session"
import { getCategories } from "@/lib/finance/queries"
import { CategoryList } from "./category-list"

export default async function CategoriesPage() {
  const { uid } = await requireSession()
  const categories = await getCategories(uid)

  return <CategoryList categories={categories} />
}
