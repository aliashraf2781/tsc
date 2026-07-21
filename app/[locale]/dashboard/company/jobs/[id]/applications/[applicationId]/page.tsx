import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getCompanyApplication } from "@/lib/api/services/company.service"
import { CompanyApplicationDetailView } from "@/features/company-jobs/components/company-application-detail-view"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"

type PageProps = {
  params: Promise<{ locale: string; id: string; applicationId: string }>
}

export default async function CompanyApplicationDetailPage({ params }: PageProps) {
  const { locale, id, applicationId } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.accessToken) {
    // Allow development impersonation via cookie
    if (process.env.NODE_ENV !== "production") {
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const imp = cookieStore.get("impersonate")?.value
        if (!imp || String(imp).toLowerCase() !== "company") {
          redirect(`/${locale}/sign-in`)
        }
      } catch {
        redirect(`/${locale}/sign-in`)
      }
    } else {
      redirect(`/${locale}/sign-in`)
    }
  }

    if (normalizeRole(session.user) !== "company") {
    // In dev, allow impersonation cookie to proceed
    if (process.env.NODE_ENV !== "production") {
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const imp = cookieStore.get("impersonate")?.value
        if (imp && String(imp).toLowerCase() === "company") {
          // allow dev impersonation
        } else {
          redirect(`/${locale}/dashboard`)
        }
      } catch {
        redirect(`/${locale}/dashboard`)
      }
    } else {
      redirect(`/${locale}/dashboard`)
    }
  }

  const jobId = Number(id)
  const appId = Number(applicationId)

  if (!Number.isFinite(jobId) || jobId <= 0 || !Number.isFinite(appId) || appId <= 0) {
    notFound()
  }

  const token = session.accessToken as string | undefined
  if (!token) redirect(`/${locale}/sign-in`)
  const application = await getCompanyApplication(appId, token, locale)
  if (!application) notFound()

  return (
    <CompanyApplicationDetailView
      application={application}
      jobId={jobId}
      jobTitle={getJobTitle(application.job, locale)}
      locale={locale}
    />
  )
}
