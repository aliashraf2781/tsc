import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminCompanyDetailView } from "@/features/admin/components/admin-company-detail-view"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import type { User } from "@/lib/api/types"

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let company: User | null = null
  try {
    // Fetch with large page size to get all companies without pagination
    const result = await getAdminUsers(session.accessToken!, "company", 1, locale, 250)
    company = result.data.find((c: User) => c.id === parseInt(id)) || null
  } catch {
    // ignore
  }

  if (!company) {
    redirect(`/${locale}/dashboard/admin/companies`)
  }

  const companyProfile = company?.companyProfile || {}

  const resolveCompanyTitle = (): string => {
    if (!company) return ""
    if (companyProfile.companyName) return companyProfile.companyName
    const name = company.name
    if (!name) return ""
    if (typeof name === "string") return name
    // name may be an object with per-locale strings
    const nameObj = name as Record<string, string> | string
    if (typeof nameObj === "object") {
      return (nameObj.ar || nameObj.en || nameObj.de || nameObj.name || nameObj.title || "") as string
    }
    return typeof nameObj === "string" ? nameObj : ""
  }

  return (
    <AdminPageLayout 
      title={resolveCompanyTitle()} 
      description={`Company Profile - ${company.email}`}
    >
      <AdminCompanyDetailView company={company} locale={locale} />
    </AdminPageLayout>
  )
}
