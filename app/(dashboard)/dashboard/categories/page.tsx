"use client"

import { useState, useMemo } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { getCategoryColumns } from "@/components/data-table/columns/category-columns"
import { CategoryFormModal } from "@/components/modals/category-form-modal"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories"
import { useStore } from "@/hooks/use-store"
import type { Category } from "@/types/domain"

export default function CategoriesPage() {
  const { store } = useStore()
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const filteredCategories = useMemo(() => {
    const list = categories ?? []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    )
  }, [categories, search])

  const columns = getCategoryColumns({
    onEdit: (category) => {
      setEditingCategory(category)
      setFormOpen(true)
    },
    onDelete: (category) => setDeletingCategory(category),
  })

  if (!store) {
    return <p className="text-muted-foreground">Create a store first.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Categories</h1>
        <Button
          onClick={() => {
            setEditingCategory(null)
            setFormOpen(true)
          }}
        >
          <PlusIcon className="size-4" />
          Add Category
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories..."
      />

      <DataTable
        columns={columns}
        data={filteredCategories}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />

      <CategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        isLoading={createCategory.isPending || updateCategory.isPending}
        onSubmit={async (values) => {
          if (editingCategory) {
            await updateCategory.mutateAsync({
              params: { id: editingCategory.id },
              body: values,
            })
          } else {
            await createCategory.mutateAsync({
              body: { storeId: store.id, ...values },
            })
          }
        }}
      />

      <ConfirmModal
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"?`}
        confirmLabel="Delete"
        isLoading={deleteCategory.isPending}
        onConfirm={async () => {
          if (deletingCategory) {
            await deleteCategory.mutateAsync({ params: { id: deletingCategory.id } })
            setDeletingCategory(null)
          }
        }}
      />
    </div>
  )
}
