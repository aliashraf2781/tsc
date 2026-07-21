"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import type { Notification, PaginationMeta } from "@/lib/api/types"
import {
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/admin/actions/admin-actions"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"
import { AdminPagination } from "@/features/admin/components/admin-pagination"

export function AdminNotificationsPanel({
  notifications,
  meta,
  locale,
}: {
  notifications: Notification[]
  meta?: PaginationMeta
  locale: string
}) {
  const t = useTranslations("Admin.settings")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const isAr = locale === "ar"

  const currentPage = meta?.current_page ?? 1
  const lastPage = Math.max(meta?.last_page ?? 1, 1)
  const total = meta?.total ?? notifications.length

  const hasUnread = notifications.some((n) => !n.read_at)
  const deleteTarget = notifications.find((n) => n.id === deleteId)

  function goToPage(page: number) {
    if (page < 1 || page > lastPage || page === currentPage) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  async function runDelete() {
    if (deleteId == null || deletePending) return
    setDeleteError(null)
    setDeletePending(true)
    try {
      const result = await deleteNotificationAction(deleteId, locale)
      if (!result.ok) {
        setDeleteError(result.message ?? (isAr ? "فشل الحذف" : "Delete failed"))
        return
      }
      setDeleteId(null)
      router.refresh()
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ConfirmActionDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open && !deletePending) {
            setDeleteId(null)
            setDeleteError(null)
          }
        }}
        title={isAr ? "تأكيد الحذف" : "Confirm deletion"}
        description={isAr ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?"}
        subject={deleteTarget?.title}
        confirmLabel={t("delete")}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
        pending={deletePending}
        pendingLabel={isAr ? "جاري الحذف..." : "Deleting..."}
        tone="danger"
        error={deleteError}
        onConfirm={runDelete}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-[#111827]">
          {locale === "ar" ? "آخر الأحداث" : "System Notifications"}
        </h2>
        {notifications.length > 0 && hasUnread && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await markAllNotificationsReadAction(locale)
                if (!result.ok) {
                  setError(result.message ?? "فشل تحديث الحالة")
                } else {
                  router.refresh()
                }
              })
            }
            className="text-sm font-semibold text-[#006EA8] hover:underline disabled:opacity-50"
          >
            {t("markAllRead")}
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-[#6B7280]">{t("notificationsEmpty")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <ul className="divide-y divide-[#E5E7EB]">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 transition-colors ${
                  !n.read_at ? "bg-[#F4FBFF]/80" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#111827]">{n.title}</p>
                    {!n.read_at && (
                      <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-medium text-[#92400E]">
                        {t("unread")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#4B5563]">{n.body}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {new Date(n.created_at).toLocaleString(locale)}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {!n.read_at && (
                    <button
                      type="button"
                      disabled={pending || deletePending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await markNotificationReadAction(n.id, locale)
                          if (!result.ok) {
                            setError(result.message ?? "فشل التحديث")
                          } else {
                            router.refresh()
                          }
                        })
                      }
                      className="text-xs font-bold text-[#006EA8] hover:underline"
                    >
                      {t("markRead")}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending || deletePending}
                    onClick={() => {
                      setDeleteError(null)
                      setDeleteId(n.id)
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline"
                  >
                    {t("delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdminPagination
        currentPage={currentPage}
        lastPage={lastPage}
        onPageChange={goToPage}
        isAr={isAr}
        summary={t("notificationsPagination", {
          page: currentPage,
          last: lastPage,
          total,
        })}
      />
    </div>
  )
}
