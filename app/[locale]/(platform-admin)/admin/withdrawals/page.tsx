"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdminWithdrawals, useUpdateWithdrawal } from "@/hooks/use-admin"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { WithdrawalRequest } from "@/types/domain"

export default function AdminWithdrawalsPage() {
  const t = useTranslations("admin")
  const [page, setPage] = useState(1)
  const { data: result, isLoading } = useAdminWithdrawals(page)
  const updateWithdrawal = useUpdateWithdrawal()

  const rows = (result?.data as WithdrawalRequest[] | undefined) ?? []

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "mark_paid"
  ) => {
    await updateWithdrawal.mutateAsync({
      params: { id },
      body: { action },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{t("withdrawalQueue")}</h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noData")}</p>
      ) : (
        <div className="rounded-xl border-0 bg-white shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{row.userName ?? "—"}</p>
                      <p className="text-muted-foreground">{row.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatMoney(row.amountFormatted, row.currency)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.payoutDetails.phone ?? "—"}
                    {row.payoutDetails.operator
                      ? ` · ${row.payoutDetails.operator}`
                      : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {row.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateWithdrawal.isPending}
                            onClick={() => handleAction(row.id, "approve")}
                          >
                            {t("approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateWithdrawal.isPending}
                            onClick={() => handleAction(row.id, "reject")}
                          >
                            {t("reject")}
                          </Button>
                        </>
                      ) : null}
                      {row.status === "approved" ? (
                        <Button
                          size="sm"
                          disabled={updateWithdrawal.isPending}
                          onClick={() => handleAction(row.id, "mark_paid")}
                        >
                          {t("markPaid")}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {result?.meta && result.meta.totalPages > 1 ? (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (result.meta?.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
