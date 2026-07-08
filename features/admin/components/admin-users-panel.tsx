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

export function AdminUsersPanel({ users, locale, meta }: { users: User[]; locale: string; meta?: PaginationMeta }) {
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

  // Calculate user-specific statistics
  const totalUsers = meta?.total ?? sortedUsers.length
  const verifiedUsers = sortedUsers.filter((u) => u.emailVerified).length
  const unverifiedUsers = sortedUsers.length - verifiedUsers

  const columns = [
    { key: "name", label: t("columns.name"), className: "w-[15%]" },
    { key: "email", label: t("columns.email"), className: "w-[20%]" },
    { key: "phone", label: t("columns.phone"), className: "w-[12%]" },
    { key: "country", label: t("columns.country"), className: "w-[12%]" },
    { key: "createdAt", label: isAr ? "تاريخ التسجيل" : "Registration Date", className: "w-[15%]" },
    { key: "verification", label: isAr ? "التحقق" : "Verification", className: "w-[10%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[16%]" },
  ]

  function handleDelete(user: User) {
    toast(isAr ? "حذف هذا المستخدم؟" : "Delete this user?", {
      action: {
        label: isAr ? "حذف" : "Delete",
        onClick: () => {
          setError(null)
          startTransition(async () => {
            const result = await deleteUserAction({ id: user.id, uuid: user.uuid }, locale)
            if (!result.ok) {
              setError(result.message ?? t("error"))
              toast.error(result.message ?? t("error"))
              return
            }
            toast.success(isAr ? "تم حذف المستخدم" : "User deleted")
            router.refresh()
          })
        },
      },
      cancel: {
        label: isAr ? "إلغاء" : "Cancel",
        onClick: () => {},
      },
    })
  }

  function handleToggleSuspend(user: User) {
    const currentStatus = user.status || "active"
    const isSuspended = currentStatus === "suspended"
    const confirmMsg = isAr
      ? (isSuspended ? "هل تريد تفعيل هذا الحساب؟" : "هل تريد تعليق هذا الحساب؟")
      : (isSuspended ? "Do you want to activate this account?" : "Do you want to suspend this account?")

    toast(confirmMsg, {
      action: {
        label: isAr ? "تأكيد" : "Confirm",
        onClick: () => {
          setError(null)
          startTransition(async () => {
            const result = await suspendUserAction({ id: user.id, uuid: user.uuid }, !isSuspended, locale)
            if (!result.ok) {
              setError(result.message ?? (isAr ? "فشل تغيير حالة الحساب" : "Failed to change user status"))
              toast.error(result.message ?? (isAr ? "فشل تغيير حالة الحساب" : "Failed to change user status"))
              return
            }
            toast.success(isAr ? "تم تحديث حالة الحساب" : "Account status updated")
            router.refresh()
          })
        },
      },
      cancel: {
        label: isAr ? "إلغاء" : "Cancel",
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
            {locale === "ar" ? "إجمالي المستخدمين" : "Total Users"}
          </div>
          <div className="text-2xl font-bold text-[#111827]">{totalUsers}</div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "الحسابات المؤكدة" : "Verified Accounts"}
          </div>
          <div className="text-2xl font-bold text-[#059669]">{verifiedUsers}</div>
          <div className="text-xs text-[#6B7280]">
            {locale === "ar" ? "مؤكد" : "Verified"}
          </div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "الحسابات غير المؤكدة" : "Unverified Accounts"}
          </div>
          <div className="text-2xl font-bold text-[#D97706]">{unverifiedUsers}</div>
          <div className="text-xs text-[#6B7280]">
            {locale === "ar" ? "غير مؤكد" : "Not Verified"}
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
                  {user.emailVerified ? (isAr ? "مؤكد" : "Verified") : (isAr ? "غير مؤكد" : "Not Verified")}
                </span>
              </AdminTableCell>
              <AdminTableCell className="w-[16%] flex items-center gap-2">
                <Link
                  locale={locale}
                  href={`/dashboard/admin/users/${user.id}`}
                  className="text-xs font-semibold text-[#006EA8] hover:underline"
                >
                  {isAr ? "تعديل" : "Edit"}
                </Link>
                <span className="text-[#E5E7EB]">|</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleToggleSuspend(user)}
                  className="text-xs font-semibold text-amber-600 hover:underline disabled:opacity-50"
                >
                  {user.status === "suspended" ? (isAr ? "تفعيل" : "Activate") : (isAr ? "تعليق" : "Suspend")}
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
        summary={
          isAr
            ? `الصفحة ${currentPage} من ${lastPage} · ${totalUsers} مستخدم`
            : `Page ${currentPage} of ${lastPage} · ${totalUsers} users`
        }
      />
    </div>
  )
}
