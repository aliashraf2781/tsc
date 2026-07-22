import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession, normalizeRole } from "@/lib/auth-token"
import { getCategoriesForForm } from "@/lib/api/services/categories.service"
import { getAdminJobById, getAdminUsers } from "@/lib/api/services/admin.service"
import { CreateJobWizard, type AdminCompanyOption } from "@/features/company-jobs/components/create-job-wizard"

const COMPANIES_PAGE_SIZE = 200

export default async function AdminEditJobPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const jobId = Number(id)

  if (!Number.isFinite(jobId) || jobId <= 0) {
    redirect(`/${locale}/dashboard/admin/jobs`)
  }

  const session = await getSession()

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  if (!session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const [job, categories, companiesResult] = await Promise.all([
    getAdminJobById(jobId, session.accessToken, locale),
    getCategoriesForForm(locale, session.accessToken).catch(() => []),
    getAdminUsers(session.accessToken, "company", 1, locale, COMPANIES_PAGE_SIZE).catch(() => ({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: COMPANIES_PAGE_SIZE, total: 0 },
    })),
  ])

  if (!job) {
    notFound()
  }

  const companies: AdminCompanyOption[] = companiesResult.data.map((company) => ({
    id: Number(company.id),
    name: company.name,
    logo: company.avatar,
  }))

  return (
    <div className="block min-h-[calc(100dvh-4rem)] w-full max-w-none bg-[#F5F7FA] px-4 py-10">
      <CreateJobWizard categories={categories} companies={companies} job={job} locale={locale} />
    </div>
  )
}
