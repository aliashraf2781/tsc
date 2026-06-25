import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminJobById, getAdminJobApplicationById } from "@/lib/api/services/admin.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { CompanyApplicationDetailView } from "@/features/company-jobs/components/company-application-detail-view"

export default async function AdminJobApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; applicationId: string }>
}) {
  const { locale, id, applicationId } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Admin.jobs")

  const session = await getSession()
  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken as string
  const job = await getAdminJobById(Number(id), token, locale)
  const application = await getAdminJobApplicationById(Number(id), Number(applicationId), token, locale)

  if (!job || !application) {
    notFound()
  }

  const title = getJobTitle(job, locale)
  const userId = application.user_id || application.user?.id

  return (
    <AdminPageLayout
      title={`${t("applicationsPage.title")} — ${title}`}
      description={t("applicationsPage.title")}
    >
      <CompanyApplicationDetailView
        application={application}
        jobId={Number(id)}
        jobTitle={title}
        locale={locale}
        maskApplicantName={false}
        userProfileHref={userId ? `/dashboard/admin/users/${userId}` : undefined}
      />
    </AdminPageLayout>
  )
}
