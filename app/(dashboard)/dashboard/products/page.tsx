"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { getProductColumns } from "@/components/data-table/columns/product-columns"
import { ProductFormModal } from "@/components/modals/product-form-modal"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import { useStore } from "@/hooks/use-store"
import type { Product } from "@/types/domain"

export default function ProductsPage() {
  const { store } = useStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [featuredFilter, setFeaturedFilter] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const { data: categories } = useCategories()
  const { data: result, isLoading } = useProducts(page, 10, {
    search: search || undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    isActive:
      statusFilter === "all"
        ? undefined
        : statusFilter === "active",
    isFeatured:
      featuredFilter === "all"
        ? undefined
        : featuredFilter === "featured",
  })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const products = (result?.data as Product[] | undefined) ?? []
  const meta = result?.meta

  const columns = getProductColumns({
    currency: store?.currency,
    onEdit: (product) => {
      setEditingProduct(product)
      setFormOpen(true)
    },
    onDelete: (product) => setDeletingProduct(product),
    onToggleActive: async (product) => {
      await updateProduct.mutateAsync({
        params: { id: product.id },
        body: { isActive: !product.isActive },
      })
    },
    onToggleFeatured: async (product) => {
      await updateProduct.mutateAsync({
        params: { id: product.id },
        body: { isFeatured: !product.isFeatured },
      })
    },
  })

  if (!store) {
    return <p className="text-muted-foreground">Create a store first.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setFormOpen(true)
          }}
        >
          <PlusIcon className="size-4" />
          Add Product
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search products..."
        filters={[
          {
            label: "Category",
            value: categoryFilter,
            onChange: (value) => {
              setCategoryFilter(value)
              setPage(1)
            },
            options: [
              { label: "All categories", value: "all" },
              ...(categories ?? []).map((c) => ({
                label: c.name,
                value: c.id,
              })),
            ],
          },
          {
            label: "Status",
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value)
              setPage(1)
            },
            options: [
              { label: "All statuses", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          {
            label: "Featured",
            value: featuredFilter,
            onChange: (value) => {
              setFeaturedFilter(value)
              setPage(1)
            },
            options: [
              { label: "All products", value: "all" },
              { label: "Featured", value: "featured" },
              { label: "Not featured", value: "not-featured" },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={products}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />

      <ProductFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
        isLoading={createProduct.isPending || updateProduct.isPending}
        onSubmit={async (values) => {
          const body = {
            name: values.name,
            description: values.description,
            price: values.price,
            images: values.images,
            isFeatured: values.isFeatured,
            inventory: values.inventory,
            sizes: values.sizes,
            variations: values.variations,
            modifiers: values.modifiers,
            categoryId: values.categoryId || null,
          }

          if (editingProduct) {
            await updateProduct.mutateAsync({
              params: { id: editingProduct.id },
              body,
            })
          } else {
            await createProduct.mutateAsync({
              body: {
                storeId: store.id,
                ...body,
                categoryId: values.categoryId || undefined,
              },
            })
          }
        }}
      />

      <ConfirmModal
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.name}"?`}
        confirmLabel="Delete"
        isLoading={deleteProduct.isPending}
        onConfirm={async () => {
          if (deletingProduct) {
            await deleteProduct.mutateAsync({ params: { id: deletingProduct.id } })
            setDeletingProduct(null)
          }
        }}
      />
    </div>
  )
}
