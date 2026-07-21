import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getNotifications } from "@/lib/api/services/notifications.service"
import type { Notification, PaginationMeta } from "@/lib/api/types"
import { AdminNotificationsPanel } from "@/features/admin/components/admin-notifications-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminNotificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const { page: pageParam } = await searchParams
  setRequestLocale(locale)
  const session = await getSession()
  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const needsClientPersist = Boolean((session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist)

  const token = session.accessToken
  const page = Math.max(1, Number(pageParam) || 1)

  let notificationsResult: { data: Notification[]; meta?: PaginationMeta } = {
    data: [],
    meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
  }
  try {
    notificationsResult = await getNotifications(token ?? "", page, locale)
  } catch (err) {
    console.error("[AdminNotificationsPage] getNotifications error:", err)
  }

  return (
    <AdminPageLayout
      title={locale === "ar" ? "آخر الأحداث" : "Recent Events"}
      description={
        locale === "ar"
          ? "عرض وإدارة آخر الأحداث والتنبيهات في النظام"
          : "Review and manage recent system events and notifications"
      }
      needsClientPersist={needsClientPersist}
    >
      <AdminNotificationsPanel
        notifications={notificationsResult.data}
        meta={notificationsResult.meta}
        locale={locale}
      />
    </AdminPageLayout>
  )
}
