import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminUsers, getAdminUserStats } from "@/lib/api/services/admin.service"
import { AdminCompaniesPanel } from "@/features/admin/components/admin-companies-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminCompaniesPage({
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
  const t = await getTranslations("Admin.companies")

  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const currentPage = Math.max(1, Number(pageParam) || 1)

  let companies: Awaited<ReturnType<typeof getAdminUsers>>["data"] = []
  let meta: Awaited<ReturnType<typeof getAdminUsers>>["meta"] | undefined
  try {
    const result = await getAdminUsers(session.accessToken!, "company", currentPage, locale)
    companies = result.data
    meta = result.meta
  } catch {
    // empty
  }

  let stats: Awaited<ReturnType<typeof getAdminUserStats>> | undefined
  try {
    stats = await getAdminUserStats(session.accessToken!, locale, "company")
  } catch {
    // ignore
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminCompaniesPanel companies={companies} locale={locale} meta={meta} stats={stats} />
    </AdminPageLayout>
  )
}
