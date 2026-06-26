"use client"

import { useMemo, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { getStoreColumns } from "@/components/data-table/columns/store-columns"
import { CreateStoreModal } from "@/components/modals/create-store-modal"
import { useCreateStore } from "@/components/providers/store-provider"
import { useStore } from "@/hooks/use-store"

export default function StoresPage() {
  const router = useRouter()
  const { store, stores, setActiveStore, isLoading } = useStore()
  const createStore = useCreateStore()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState("")

  const filteredStores = useMemo(() => {
    if (!search.trim()) return stores
    const q = search.toLowerCase()
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    )
  }, [stores, search])

  const columns = getStoreColumns({
    activeStoreId: store?.id,
    onSwitch: setActiveStore,
    onOpenSettings: (s) => {
      setActiveStore(s)
      router.push("/dashboard/settings")
    },
  })

  async function handleCreate() {
    if (!newStoreName.trim()) return
    const created = await createStore.mutateAsync({
      body: { name: newStoreName.trim() },
    })
    setActiveStore(created)
    setNewStoreName("")
    setCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Stores</h1>
          <p className="text-sm text-muted-foreground">
            All your catalogs — copy and share links with customers
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" />
          Add store
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search stores..."
      />

      <DataTable
        columns={columns}
        data={filteredStores}
        isLoading={isLoading}
        enableSelection={false}
        getRowId={(row) => row.id}
      />

      <CreateStoreModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        name={newStoreName}
        onNameChange={setNewStoreName}
        onSubmit={handleCreate}
        isLoading={createStore.isPending}
      />
    </div>
  )
}
