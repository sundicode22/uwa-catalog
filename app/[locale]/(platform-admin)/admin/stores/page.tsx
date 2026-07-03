"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAdminStores } from "@/hooks/use-admin"
import { formatDateTime } from "@/lib/format"
import type { AdminStoreRow } from "@/types/domain"

export default function AdminStoresPage() {
  const t = useTranslations("admin")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data: result, isLoading } = useAdminStores(page, search)

  const rows = (result?.data as AdminStoreRow[] | undefined) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">{t("stores")}</h1>
        <Input
          className="max-w-xs"
          placeholder={t("searchStores")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="rounded-xl border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{t("orders")}</TableHead>
                <TableHead>{t("visitors7d")}</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">/c/{row.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{row.ownerEmail}</TableCell>
                  <TableCell>
                    <Badge variant={row.isPublished ? "default" : "secondary"}>
                      {row.isPublished ? t("published") : t("draft")}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.orderCount}</TableCell>
                  <TableCell>{row.visitorCount7d}</TableCell>
                  <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
