import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { AdminJobApplicationsPage } from "@/features/admin/components/admin-job-applications-page"

export default async function AdminJobApplicationsRoutePage({
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

  if (!session.accessToken) {
    notFound()
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminJobApplicationsPage jobId={jobId} locale={locale} accessToken={session.accessToken} />
    </div>
  )
}
