"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FormInput } from "@/components/ui/form-input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useApiMutation, useApiQuery } from "@/hooks/use-api"
import type { PlanDefinition } from "@/types/domain"

function PlanEditor({
  plan,
  onSaved,
}: {
  plan: PlanDefinition
  onSaved: () => void
}) {
  const [name, setName] = useState(plan.name)
  const [description, setDescription] = useState(plan.description)
  const [monthlyPriceUsd, setMonthlyPriceUsd] = useState(
    String(plan.monthlyPriceUsd)
  )
  const [monthlyPriceXaf, setMonthlyPriceXaf] = useState(
    String(plan.monthlyPriceXaf)
  )
  const [maxStores, setMaxStores] = useState(String(plan.maxStores))
  const [maxProductsPerStore, setMaxProductsPerStore] = useState(
    String(plan.maxProductsPerStore)
  )
  const [featuresText, setFeaturesText] = useState(plan.features.join("\n"))
  const [isPopular, setIsPopular] = useState(plan.isPopular ?? false)
  const [isActive, setIsActive] = useState(plan.isActive ?? true)

  useEffect(() => {
    setName(plan.name)
    setDescription(plan.description)
    setMonthlyPriceUsd(String(plan.monthlyPriceUsd))
    setMonthlyPriceXaf(String(plan.monthlyPriceXaf))
    setMaxStores(String(plan.maxStores))
    setMaxProductsPerStore(String(plan.maxProductsPerStore))
    setFeaturesText(plan.features.join("\n"))
    setIsPopular(plan.isPopular ?? false)
    setIsActive(plan.isActive ?? true)
  }, [plan])

  const updatePlan = useApiMutation(
    "PATCH /billing/admin/plans/:planId",
    "PATCH",
    {
      successMessage: `${plan.name} plan updated`,
      invalidateKeys: [
        ["GET /billing"],
        ["GET /billing/admin/plans"],
        ["GET /billing/plans"],
      ],
    }
  )

  return (
    <form
      className="space-y-4 rounded-lg border border-border p-4"
      onSubmit={async (event) => {
        event.preventDefault()
        await updatePlan.mutateAsync({
          params: { planId: plan.id },
          body: {
            name,
            description,
            monthlyPriceUsd: Number(monthlyPriceUsd),
            monthlyPriceXaf: Number(monthlyPriceXaf),
            maxStores: Number(maxStores),
            maxProductsPerStore: Number(maxProductsPerStore),
            features: featuresText
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
            isPopular,
            isActive,
          },
        })
        onSaved()
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium capitalize">{plan.id}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id={`${plan.id}-popular`}
              checked={isPopular}
              onCheckedChange={setIsPopular}
            />
            <Label htmlFor={`${plan.id}-popular`} className="text-sm">
              Popular
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={`${plan.id}-active`}
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor={`${plan.id}-active`} className="text-sm">
              Active
            </Label>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <FormInput
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>USD / month</Label>
          <FormInput
            type="number"
            min={0}
            value={monthlyPriceUsd}
            onChange={(e) => setMonthlyPriceUsd(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>XAF / month</Label>
          <FormInput
            type="number"
            min={0}
            value={monthlyPriceXaf}
            onChange={(e) => setMonthlyPriceXaf(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Max stores</Label>
          <FormInput
            type="number"
            min={1}
            value={maxStores}
            onChange={(e) => setMaxStores(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Max products / store</Label>
          <FormInput
            type="number"
            min={1}
            value={maxProductsPerStore}
            onChange={(e) => setMaxProductsPerStore(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Features (one per line)</Label>
        <Textarea
          rows={4}
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
        />
      </div>

      <Button type="submit" size="sm" disabled={updatePlan.isPending}>
        {updatePlan.isPending ? "Saving..." : "Save plan"}
      </Button>
    </form>
  )
}

export function BillingPlanAdmin() {
  const { data, isLoading, refetch } = useApiQuery("GET /billing/admin/plans", {
    queryKey: ["GET /billing/admin/plans"],
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform plan definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data?.plans?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform plan definitions</CardTitle>
          <CardDescription>
            No plans in the database yet. Run{" "}
            <code className="text-xs">npm run db:seed:plans</code> first.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform plan definitions</CardTitle>
        <CardDescription>
          Edit pricing shown on the landing page and billing limits. Changes
          apply immediately for new checkouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.plans.map((plan) => (
          <PlanEditor
            key={plan.id}
            plan={plan}
            onSaved={() => {
              void refetch()
            }}
          />
        ))}
      </CardContent>
    </Card>
  )
}
