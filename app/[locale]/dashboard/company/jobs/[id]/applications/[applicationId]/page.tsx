import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getCompanyApplication, getCompanyJob } from "@/lib/api/services/company.service"
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
  const [job, application] = await Promise.all([
    getCompanyJob(jobId, token, locale),
    getCompanyApplication(jobId, appId, token, locale),
  ])
  if (!job) notFound()

  if (!application) {
    // development fallback when impersonating
    if (process.env.NODE_ENV !== "production") {
      const { cookies } = await import("next/headers")
      const cookieStore = await cookies()
      const imp = cookieStore.get("impersonate")?.value
      if (imp && String(imp).toLowerCase() === "company") {
        const mockApp = {
          id: appId,
          job: job,
          user: { id: 123, name: "Ahmed Saeed", avatar: "", country: { id: 1, name: "Egypt", code: "EG" }, city: { id: 1, name: "Cairo", country: { id: 1, name: "Egypt", code: "EG" } } },
          status: "pending",
          applied_at: new Date().toISOString(),
          cv_url: undefined,
        }
        return (
          <CompanyApplicationDetailView application={mockApp as any} jobId={jobId} jobTitle={getJobTitle(job, locale)} locale={locale} />
        )
      }
    }
    notFound()
  }

  return (
    <CompanyApplicationDetailView
      application={application}
      jobId={jobId}
      jobTitle={getJobTitle(job, locale)}
      locale={locale}
    />
  )
}
