"use client"

import * as React from "react"
import { toast } from "sonner"
import { StoreIcon, PlusIcon, ChevronsUpDownIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CreateStoreModal } from "@/components/modals/create-store-modal"
import {
  useStoreContext,
  useCreateStore,
} from "@/components/providers/store-provider"

export function StoreSwitcher() {
  const { isMobile } = useSidebar()
  const { store, stores, setActiveStore } = useStoreContext()
  const createStore = useCreateStore()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newStoreName, setNewStoreName] = React.useState("")

  async function handleCreate() {
    if (!newStoreName.trim()) return
    const created = await createStore.mutateAsync({
      body: { name: newStoreName.trim() },
    })
    setActiveStore(created)
    setNewStoreName("")
    setCreateOpen(false)
  }

  if (!store && stores.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={() => setCreateOpen(true)}>
            <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
              <PlusIcon className="size-4" />
            </div>
            <span className="font-medium">Create store</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <CreateStoreModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          name={newStoreName}
          onNameChange={setNewStoreName}
          onSubmit={handleCreate}
          isLoading={createStore.isPending}
        />
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                  <StoreIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{store?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {stores.length} store{stores.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Your stores
              </DropdownMenuLabel>
              {stores.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => {
                    setActiveStore(s)
                    if (s.id !== store?.id) {
                      toast.success(`Switched to ${s.name}`)
                    }
                  }}
                  className="gap-2 p-2"
                >
                  <StoreIcon className="size-4 shrink-0" />
                  <span className="truncate">{s.name}</span>
                  {s.id === store?.id && (
                    <span className="ml-auto text-xs text-muted-foreground">Active</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon className="size-4" />
                <span>Add store</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateStoreModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        name={newStoreName}
        onNameChange={setNewStoreName}
        onSubmit={handleCreate}
        isLoading={createStore.isPending}
      />
    </>
  )
}
