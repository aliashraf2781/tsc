import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminUsersPanel } from "@/features/admin/components/admin-users-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { page: pageParam } = await searchParams
  const session = await getSession()
  const t = await getTranslations("Admin.users")

  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const currentPage = Math.max(1, Number(pageParam) || 1)

  let users: Awaited<ReturnType<typeof getAdminUsers>>["data"] = []
  let meta: Awaited<ReturnType<typeof getAdminUsers>>["meta"] | undefined
  try {
    const result = await getAdminUsers(session.accessToken!, "user", currentPage, locale)
    users = result.data
    meta = result.meta
  } catch (err) {
    // ignore
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminUsersPanel users={users} locale={locale} meta={meta} />
    </AdminPageLayout>
  )
}
