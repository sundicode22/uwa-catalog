"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
import { useAdminUsers } from "@/hooks/use-admin"
import { formatDateTime } from "@/lib/format"
import type { AdminUserRow } from "@/types/domain"

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data: result, isLoading } = useAdminUsers(page, search)

  const rows = (result?.data as AdminUserRow[] | undefined) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">{t("users")}</h1>
        <Input
          className="max-w-xs"
          placeholder={t("searchUsers")}
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
        <div className="rounded-xl border-0 bg-white shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stores</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name ?? "—"}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.storeCount}</TableCell>
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
