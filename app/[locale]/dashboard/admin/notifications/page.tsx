import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getNotifications } from "@/lib/api/services/notifications.service"
import { AdminNotificationsPanel } from "@/features/admin/components/admin-notifications-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const needsClientPersist = Boolean((session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist)

  const token = session.accessToken

  let notificationsResult: { data: any[] } = { data: [] }
  try {
    // token may be undefined; pass empty string to satisfy API signature —
    // the called function will throw an ApiError for unauthenticated requests.
    notificationsResult = await getNotifications(token ?? "", 1, locale)
  } catch (err) {
    console.error("[AdminNotificationsPage] getNotifications error:", err)
    notificationsResult = { data: [] }
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
      <AdminNotificationsPanel notifications={notificationsResult.data} locale={locale} />
    </AdminPageLayout>
  )
}
