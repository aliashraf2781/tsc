import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminJobById } from "@/lib/api/services/admin.service"
import { getAdminJobApplications } from "@/lib/api/services/admin.service"
import { AdminJobDetailView } from "@/features/admin/components/admin-job-detail-view"

export default async function AdminJobDetailPage({
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

  if (!session.user || normalizeRole(session.user) !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const job = await getAdminJobById(jobId, session.accessToken, locale)

  if (!job) {
    notFound()
  }

  // If the upstream job object doesn't include applications_count, fetch
  // the applications endpoint to get an authoritative count for display.
  if (job && (job.applications_count == null || job.applications_count === 0)) {
    try {
      const appsRes = await getAdminJobApplications(jobId, session.accessToken, 1, locale)
      const total = appsRes?.meta?.total ?? (Array.isArray(appsRes?.data) ? appsRes.data.length : undefined)
      if (typeof total === "number") {
        job.applications_count = total
      }
    } catch (err) {
      // ignore and fall back to job.applications_count
    }
  }

  return <AdminJobDetailView job={job} locale={locale} />
}
