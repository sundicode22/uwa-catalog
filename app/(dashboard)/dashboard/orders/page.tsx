"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { getOrderColumns } from "@/components/data-table/columns/order-columns"
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders"
import { useStore } from "@/hooks/use-store"
import type { Order, OrderStatus } from "@/types/domain"

export default function OrdersPage() {
  const { store } = useStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { data: result, isLoading } = useOrders(page, 10, {
    search,
    status: statusFilter,
  })
  const updateStatus = useUpdateOrderStatus()

  const orders = (result?.data as Order[] | undefined) ?? []
  const meta = result?.meta

  if (!store) {
    return <p className="text-muted-foreground">Create a store first.</p>
  }

  const columns = getOrderColumns({
    currency: store.currency,
    onStatusChange: async (order, status: OrderStatus) => {
      await updateStatus.mutateAsync({
        params: { id: order.id },
        body: { status },
      })
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Orders</h1>
        {store.orderMode === "whatsapp" ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Saved orders from WhatsApp and catalog checkout appear here.
          </p>
        ) : null}
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search by customer or phone..."
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value)
              setPage(1)
            },
            options: [
              { label: "All statuses", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Fulfilled", value: "fulfilled" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={orders}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />
    </div>
  )
}
