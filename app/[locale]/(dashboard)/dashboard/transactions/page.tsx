"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { getTransactionColumns } from "@/components/data-table/columns/transaction-columns"
import { useTransactions } from "@/hooks/use-transactions"
import { useStore } from "@/hooks/use-store"
import type { StoreTransactionListItem } from "@/types/domain"

export default function TransactionsPage() {
  const { store } = useStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: result, isLoading } = useTransactions(page, 10, {
    search,
    status: statusFilter,
  })

  const transactions =
    (result?.data as StoreTransactionListItem[] | undefined) ?? []
  const meta = result?.meta

  if (!store) {
    return <p className="text-muted-foreground">Create a store first.</p>
  }

  const columns = getTransactionColumns(store.currency)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sales recorded from catalog and WhatsApp orders for {store.name}
        </p>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search by customer, reference, or method..."
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
              { label: "Completed", value: "completed" },
              { label: "Voided", value: "voided" },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={transactions}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />
    </div>
  )
}
