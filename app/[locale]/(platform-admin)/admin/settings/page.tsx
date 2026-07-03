"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { BillingPlanAdmin } from "@/components/dashboard/billing-plan-admin"
import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/use-admin"
import { useBillingSummary } from "@/hooks/use-billing"

export default function AdminSettingsPage() {
  const t = useTranslations("admin")
  const { data, isLoading } = useAdminSettings()
  const updateSettings = useUpdateAdminSettings()
  const { data: billing } = useBillingSummary()

  const [platformFeePercent, setPlatformFeePercent] = useState("5")
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState("1000")

  useEffect(() => {
    if (data?.settings) {
      setPlatformFeePercent(String(data.settings.platformFeePercent))
      setMinWithdrawalAmount(String(data.settings.minWithdrawalAmount))
    }
  }, [data?.settings])

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      body: {
        platformFeePercent: parseFloat(platformFeePercent),
        minWithdrawalAmount: parseInt(minWithdrawalAmount, 10),
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{t("settings")}</h1>
      </div>

      <Card className="max-w-lg border border-black/5 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <CardHeader>
          <CardTitle>Platform wallet settings</CardTitle>
          <CardDescription>
            Configure fees deducted from order earnings and minimum withdrawal amounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="platformFee">{t("platformFee")}</Label>
                <Input
                  id="platformFee"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="minWithdrawal">{t("minWithdrawal")}</Label>
                <Input
                  id="minWithdrawal"
                  type="number"
                  min={0}
                  value={minWithdrawalAmount}
                  onChange={(e) => setMinWithdrawalAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                {t("saveSettings")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {billing?.canManagePlans ? <BillingPlanAdmin /> : null}
    </div>
  )
}
