"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { getCustomerColumns } from "@/components/data-table/columns/customer-columns"
import { CustomerFormModal } from "@/components/modals/customer-form-modal"
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
} from "@/hooks/use-customers"
import { useStore } from "@/hooks/use-store"
import type { StoreCustomer } from "@/types/domain"

export default function CustomersPage() {
  const { store } = useStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<StoreCustomer | null>(
    null
  )

  const { data: result, isLoading } = useCustomers(page, 10, { search })
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const customers = (result?.data as StoreCustomer[] | undefined) ?? []
  const meta = result?.meta

  if (!store) {
    return <p className="text-muted-foreground">Create a store first.</p>
  }

  const columns = getCustomerColumns({
    currency: store.currency,
    onEdit: (customer) => {
      setEditingCustomer(customer)
      setFormOpen(true)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers are saved automatically when orders are placed. You can also
            add or edit them here.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null)
            setFormOpen(true)
          }}
        >
          <PlusIcon className="size-4" />
          Add Customer
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search by name, phone, or email..."
      />

      <DataTable
        columns={columns}
        data={customers}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />

      <CustomerFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
        isLoading={createCustomer.isPending || updateCustomer.isPending}
        onSubmit={async (values) => {
          const payload = {
            name: values.name,
            phone: values.phone,
            email: values.email || undefined,
            address: values.address || undefined,
            city: values.city || undefined,
            region: values.region || undefined,
            notes: values.notes || undefined,
          }

          if (editingCustomer) {
            await updateCustomer.mutateAsync({
              params: { customerId: editingCustomer.id },
              body: payload,
            })
            return
          }

          await createCustomer.mutateAsync({
            body: {
              storeId: store.id,
              ...payload,
            },
          })
        }}
      />
    </div>
  )
}
