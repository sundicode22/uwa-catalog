"use client"

import { useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormInput } from "@/components/ui/form-input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDiscountCodes, useCreateDiscountCode, useDeleteDiscountCode } from "@/hooks/use-discounts"
import { formatMoney } from "@/lib/format"
import type { Store } from "@/types/domain"

export function DiscountCodesCard({ store }: { store: Store }) {
  const { data: codes = [], isLoading } = useDiscountCodes(store.id)
  const createCode = useCreateDiscountCode(store.id)
  const deleteCode = useDeleteDiscountCode(store.id)
  const [code, setCode] = useState("")
  const [type, setType] = useState<"percent" | "fixed">("percent")
  const [value, setValue] = useState("10")

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Discount codes</CardTitle>
        <CardDescription>
          Offer percent or fixed discounts at checkout.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <FormInput
            placeholder="SUMMER10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <Select value={type} onValueChange={(v) => setType(v as "percent" | "fixed")}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percent</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          <FormInput
            placeholder={type === "percent" ? "10" : "5.00"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            type="button"
            className="gap-2"
            disabled={!code || createCode.isPending}
            onClick={async () => {
              await createCode.mutateAsync({
                body: {
                  storeId: store.id,
                  code,
                  type,
                  value,
                },
              })
              setCode("")
            }}
          >
            <PlusIcon className="size-4" />
            Add
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading codes...</p>
        ) : codes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discount codes yet.</p>
        ) : (
          <div className="space-y-2">
            {codes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === "percent"
                      ? `${item.value}% off`
                      : `${formatMoney(item.value, store.currency)} off`}
                    {item.usedCount > 0 ? ` · used ${item.usedCount}x` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={item.isActive} disabled />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCode.mutate({ params: { id: item.id } })}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
