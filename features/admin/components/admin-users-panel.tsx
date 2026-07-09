"use client"

import { Link } from "@/i18n/navigation"
import { useState, useTransition } from "react"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import type { PaginationMeta, User } from "@/lib/api/types"
import { deleteUserAction, suspendUserAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { AdminPagination } from "./admin-pagination"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AdminUsersPanel({
  users,
  locale,
  meta,
  stats,
}: {
  users: User[]
  locale: string
  meta?: PaginationMeta
  stats?: { total: number; verified: number; unverified: number }
}) {
  const t = useTranslations("Admin.users")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isAr = locale === "ar"

  const currentPage = meta?.current_page ?? 1
  const lastPage = Math.max(meta?.last_page ?? 1, 1)

  function goToPage(page: number) {
    if (page < 1 || page > lastPage || page === currentPage) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  // Sort users so that the latest registered user (highest ID or newest createdAt) appears first
  const sortedUsers = [...users].sort((a, b) => {
    const idA = Number(a.id) || 0
    const idB = Number(b.id) || 0
    if (idB !== idA) return idB - idA
    const dateA = new Date((a as any).createdAt || 0).getTime()
    const dateB = new Date((b as any).createdAt || 0).getTime()
    return dateB - dateA
  })

  // Calculate user-specific statistics across all accounts (not just the current page)
  const totalUsers = stats?.total ?? meta?.total ?? sortedUsers.length
  const verifiedUsers = stats?.verified ?? sortedUsers.filter((u) => u.emailVerified).length
  const unverifiedUsers = stats?.unverified ?? sortedUsers.length - verifiedUsers

  const columns = [
    { key: "name", label: t("columns.name"), className: "w-[15%]" },
    { key: "email", label: t("columns.email"), className: "w-[20%]" },
    { key: "phone", label: t("columns.phone"), className: "w-[12%]" },
    { key: "country", label: t("columns.country"), className: "w-[12%]" },
    { key: "createdAt", label: t("columns.registrationDate"), className: "w-[15%]" },
    { key: "verification", label: t("columns.verification"), className: "w-[10%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[16%]" },
  ]

  function handleDelete(user: User) {
    toast(t("deleteConfirm"), {
      action: {
        label: t("delete"),
        onClick: () => {
          setError(null)
          startTransition(async () => {
            const result = await deleteUserAction({ id: user.id, uuid: user.uuid }, locale)
            if (!result.ok) {
              setError(result.message ?? t("error"))
              toast.error(result.message ?? t("error"))
              return
            }
            toast.success(t("deleteSuccess"))
            router.refresh()
          })
        },
      },
      cancel: {
        label: t("cancel"),
        onClick: () => {},
      },
    })
  }

  function handleToggleSuspend(user: User) {
    const currentStatus = user.status || "active"
    const isSuspended = currentStatus === "suspended"
    const confirmMsg = isSuspended ? t("activateConfirm") : t("suspendConfirm")

    toast(confirmMsg, {
      action: {
        label: t("confirm"),
        onClick: () => {
          setError(null)
          startTransition(async () => {
            const result = await suspendUserAction({ id: user.id, uuid: user.uuid }, !isSuspended, locale)
            if (!result.ok) {
              setError(result.message ?? t("statusUpdateError"))
              toast.error(result.message ?? t("statusUpdateError"))
              return
            }
            toast.success(t("statusUpdateSuccess"))
            router.refresh()
          })
        },
      },
      cancel: {
        label: t("cancel"),
        onClick: () => {},
      },
    })
  }

  return (
    <div className="flex flex-col gap-6 text-start">
      {/* Statistics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {t("stats.total")}
          </div>
          <div className="text-2xl font-bold text-[#111827]">{totalUsers}</div>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {t("stats.verified")}
          </div>
          <div className="text-2xl font-bold text-[#059669]">{verifiedUsers}</div>
          <div className="text-xs text-[#6B7280]">
            {t("stats.verifiedLabel")}
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {t("stats.unverified")}
          </div>
          <div className="text-2xl font-bold text-[#D97706]">{unverifiedUsers}</div>
          <div className="text-xs text-[#6B7280]">
            {t("stats.unverifiedLabel")}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      {/* Users Table */}
      <AdminTableShell columns={columns} isEmpty={sortedUsers.length === 0} emptyMessage={t("empty")} isRTL={locale === "ar"}>
        {sortedUsers.map((user, index) => {
          const formattedDate = (() => {
            const dateVal = (user as any).createdAt || (user as any).created_at
            if (!dateVal) return "—"
            try {
              return new Date(dateVal).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            } catch {
              return "—"
            }
          })()

          return (
            <AdminTableRow key={user.id} striped={index % 2 === 1}>
              <AdminTableCell className="w-[15%]">
                <Link locale={locale} href={`/dashboard/admin/users/${user.id}`} className="font-medium hover:underline text-[#006EA8] block truncate">
                  {user.name}
                </Link>
              </AdminTableCell>
              <AdminTableCell className="w-[20%] text-xs truncate">{user.email}</AdminTableCell>
              <AdminTableCell className="w-[12%] text-xs">{user.phone || "—"}</AdminTableCell>
              <AdminTableCell className="w-[12%] text-xs">
                {user.country?.name || "—"}
              </AdminTableCell>
              <AdminTableCell className="w-[15%] text-xs">
                {formattedDate}
              </AdminTableCell>
              <AdminTableCell className="w-[10%]">
                <span className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                  user.emailVerified ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {user.emailVerified ? t("verification.verified") : t("verification.notVerified")}
                </span>
              </AdminTableCell>
              <AdminTableCell className="w-[16%] flex items-center gap-2">
                <Link
                  locale={locale}
                  href={`/dashboard/admin/users/${user.id}`}
                  className="text-xs font-semibold text-[#006EA8] hover:underline"
                >
                  {t("edit")}
                </Link>
                <span className="text-[#E5E7EB]">|</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleToggleSuspend(user)}
                  className="text-xs font-semibold text-amber-600 hover:underline disabled:opacity-50"
                >
                  {user.status === "suspended" ? t("activate") : t("suspend")}
                </button>
                <span className="text-[#E5E7EB]">|</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(user)}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  {t("delete")}
                </button>
              </AdminTableCell>
            </AdminTableRow>
          )
        })}
      </AdminTableShell>

      <AdminPagination
        currentPage={currentPage}
        lastPage={lastPage}
        onPageChange={goToPage}
        isAr={isAr}
        summary={t("pagination", { page: currentPage, last: lastPage, total: totalUsers })}
      />
    </div>
  )
}
