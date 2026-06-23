"use client"

import { useState } from "react"
import {
  ArrowRightIcon,
  LinkIcon,
  PackageIcon,
  SparklesIcon,
  StoreIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateStoreModal } from "@/components/modals/create-store-modal"
import { useCreateStore, useStoreContext } from "@/components/providers/store-provider"
import { getSiteName } from "@/lib/seo/site"

const STEPS = [
  {
    icon: StoreIcon,
    title: "Create your store",
    description: "Name your catalog and set your brand in seconds.",
  },
  {
    icon: PackageIcon,
    title: "Add products",
    description: "Upload photos, prices, and inventory for each item.",
  },
  {
    icon: LinkIcon,
    title: "Share & sell",
    description: "Send your catalog link and start taking orders.",
  },
] as const

export function DashboardWelcome() {
  const siteName = getSiteName()
  const { setActiveStore } = useStoreContext()
  const createStore = useCreateStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState("")

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
    <>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
        <div className="animate-fade-in-up w-full max-w-2xl">
          <div className="overflow-hidden rounded-2xl bg-background shadow-sm">
            <div className="bg-brand-gradient-hero px-6 py-8 text-center sm:px-10">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <StoreIcon className="size-7" />
              </div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <SparklesIcon className="size-3.5" />
                You&apos;re almost there
              </p>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Welcome to {siteName}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Create your first store to publish a beautiful catalog, manage
                orders, and start selling today.
              </p>
            </div>

            <div className="space-y-4 px-6 py-6 sm:px-10 sm:py-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {STEPS.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-xl bg-gray-50/80 p-4"
                  >
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="size-4" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-11 px-6" onClick={() => setCreateOpen(true)}>
                  Create your first store
                  <ArrowRightIcon className="size-4" />
                </Button>
                <p className="text-center text-xs text-muted-foreground sm:text-left">
                  Or use <span className="font-medium text-foreground">Create store</span> in
                  the sidebar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
