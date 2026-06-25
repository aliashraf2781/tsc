import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminCompaniesPanel } from "@/features/admin/components/admin-companies-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminCompaniesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("Admin.companies")

  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let companies: Awaited<ReturnType<typeof getAdminUsers>>["data"] = []
  try {
    const result = await getAdminUsers(session.accessToken!, "company", 1, locale)
    companies = result.data
  } catch (err) {
    // empty
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminCompaniesPanel companies={companies} locale={locale} />
    </AdminPageLayout>
  )
}
