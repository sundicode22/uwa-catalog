"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowUpRightIcon, WalletIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"
import {
  useCreateWithdrawal,
  useWalletLedger,
  useWalletSummary,
  useWithdrawals,
} from "@/hooks/use-wallet"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { WalletLedgerEntry, WithdrawalRequest } from "@/types/domain"

function LedgerTypeBadge({ type }: { type: WalletLedgerEntry["type"] }) {
  const labels: Record<WalletLedgerEntry["type"], string> = {
    order_credit: "Order credit",
    platform_fee: "Platform fee",
    withdrawal_debit: "Withdrawal",
    withdrawal_refund: "Refund",
    adjustment: "Adjustment",
  }
  return <Badge variant="secondary">{labels[type]}</Badge>
}

function WithdrawalStatusBadge({ status }: { status: WithdrawalRequest["status"] }) {
  const variant =
    status === "paid"
      ? "default"
      : status === "pending" || status === "approved" || status === "processing"
        ? "secondary"
        : "destructive"
  return <Badge variant={variant}>{status}</Badge>
}

export function WalletPageContent() {
  const t = useTranslations("wallet")
  const { data: summary, isLoading } = useWalletSummary()
  const [ledgerPage, setLedgerPage] = useState(1)
  const [withdrawalsPage, setWithdrawalsPage] = useState(1)
  const { data: ledgerResult, isLoading: ledgerLoading } = useWalletLedger(ledgerPage)
  const { data: withdrawalsResult, isLoading: withdrawalsLoading } =
    useWithdrawals(withdrawalsPage)
  const createWithdrawal = useCreateWithdrawal()

  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("XAF")
  const [accountName, setAccountName] = useState("")
  const [phone, setPhone] = useState("")
  const [operator, setOperator] = useState("mtn")

  const primaryAccount = summary?.accounts?.[0]
  const ledger = (ledgerResult?.data as WalletLedgerEntry[] | undefined) ?? []
  const withdrawals =
    (withdrawalsResult?.data as WithdrawalRequest[] | undefined) ?? []

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount.trim()) return
    await createWithdrawal.mutateAsync({
      body: {
        amount,
        currency: primaryAccount?.currency ?? currency,
        payoutMethod: "mobile_money",
        payoutDetails: { accountName, phone, operator },
      },
    })
    setAmount("")
    setAccountName("")
    setPhone("")
    setOperator("mtn")
    setWithdrawOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <WalletIcon className="size-5" />
          {t("title")}
        </h1>
      </div>

      <Card className="border-0 bg-white shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{t("availableBalance")}</CardTitle>
              <CardDescription>
                {t("feeNotice", { percent: summary?.platformFeePercent ?? 0 })}
              </CardDescription>
            </div>
            <Button
              className="gap-2"
              onClick={() => setWithdrawOpen(true)}
            >
              <ArrowUpRightIcon className="size-4" />
              {t("requestWithdrawal")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {primaryAccount ? (
            <p className="text-3xl font-semibold tabular-nums">
              {formatMoney(
                primaryAccount.availableBalanceFormatted,
                primaryAccount.currency
              )}
            </p>
          ) : (
            <p className="text-3xl font-semibold tabular-nums">{formatMoney(0, currency)}</p>
          )}
          {summary?.pendingWithdrawalsCount ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("pendingWithdrawals", { count: summary.pendingWithdrawalsCount })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Modal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        mobileFullscreen
      >
        <ModalHeader onClose={() => setWithdrawOpen(false)}>
          <ModalTitle>{t("requestWithdrawal")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ModalForm>
            <p className="text-sm text-muted-foreground">
              {t("withdrawalDescription")}
            </p>
            <div className="space-y-1">
              <Label htmlFor="wd-amount">{t("amount")}</Label>
              <Input
                id="wd-amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wd-accountName">{t("accountName")}</Label>
              <Input
                id="wd-accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wd-phone">{t("phone")}</Label>
              <Input
                id="wd-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("operator")}</Label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="orange">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ModalForm>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setWithdrawOpen(false)}
          >
            {t("cancel") ?? "Cancel"}
          </Button>
          <Button
            disabled={createWithdrawal.isPending || !amount}
            onClick={handleWithdraw}
          >
            {createWithdrawal.isPending ? t("submitting") : t("submitWithdrawal")}
          </Button>
        </ModalFooter>
      </Modal>

      <Card className="border-0 bg-white shadow-none">
        <CardHeader>
          <CardTitle>{t("ledgerTitle")}</CardTitle>
          <CardDescription>{t("ledgerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {ledgerLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : ledger.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noLedger")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("balance")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <LedgerTypeBadge type={entry.type} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatMoney(entry.amountFormatted, entry.currency)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatMoney(entry.balanceAfterFormatted, entry.currency)}
                    </TableCell>
                    <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {ledgerResult?.meta && ledgerResult.meta.totalPages > 1 ? (
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={ledgerPage <= 1}
                onClick={() => setLedgerPage((p) => p - 1)}
              >
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={ledgerPage >= (ledgerResult.meta?.totalPages ?? 1)}
                onClick={() => setLedgerPage((p) => p + 1)}
              >
                {t("next")}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-none">
        <CardHeader>
          <CardTitle>{t("withdrawalsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noWithdrawals")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="tabular-nums">
                      {formatMoney(row.amountFormatted, row.currency)}
                    </TableCell>
                    <TableCell>
                      <WithdrawalStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
