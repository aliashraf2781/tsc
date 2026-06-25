import { Link } from "@/i18n/navigation"
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import {
  enrichJobsWithApplicationCounts,
  getCompanyJobs,
  getCompanyStats,
} from "@/lib/api/services/company.service"
import { getTickets } from "@/lib/api/services/tickets.service"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import type { Job } from "@/lib/api/types"
import { getProfile } from "@/lib/api/services/auth.service"
import { getProfileCompanyLogo, getProfileCompanyName, resolveCompanyLogoForDisplay } from "@/features/company-profile/lib/profile-logo"
import type { DashboardJobRow } from "@/features/dashboard/components/dashboard-jobs-table"
import { mapCompanyJobBadgeStatus } from "@/features/company-jobs/lib/job-status"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { resolveJobApplicationDeadline } from "@/features/jobs/lib/job-display"
import { formatApplicationDeadline } from "@/features/jobs/lib/job-display"
import { ApiError } from "@/lib/api/client"

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.user) {
    // Allow development impersonation via cookie `impersonate=company`
    if (process.env.NODE_ENV !== "production") {
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const imp = cookieStore.get("impersonate")?.value
        if (imp && String(imp).toLowerCase() === "company") {
          // proceed with mocked data below
        } else {
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
    redirect(`/${locale}/dashboard`)
  }

  const isAr = locale === "ar"
  const isDe = locale === "de"

  let stats = { total_jobs: 0, total_applications: 0, pending_applications: 0 }
  let jobs: Job[] = []
  let totalTickets = 0
  let profileLogo: string | undefined
  let profileCompanyName = ""

  try {
    // If impersonating in dev, return mocked data without calling upstream
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const imp = process.env.NODE_ENV !== "production" ? cookieStore.get("impersonate")?.value : undefined
    if (imp && String(imp).toLowerCase() === "company") {
   
      stats = { total_jobs: 2, total_applications: 15, pending_applications: 0 }
      totalTickets = 1
    } else {
      const token = session.accessToken as string | undefined
      if (!token) redirect(`/${locale}/sign-in`)

      // Start jobs/tickets/stats calls in parallel but do NOT wait for stats to finish —
      // prefer a fast upstream response (if it resolves quickly) and otherwise
      // compute a fallback locally after enriching job list.
      const jobsPromise = getCompanyJobs(token as string, 1, locale as "ar" | "en" | "de")
      const ticketsPromise = getTickets(token as string, 1, locale as "ar" | "en" | "de")
      const statsPromise = getCompanyStats(token as string, locale as "ar" | "en" | "de")
      const profilePromise = getProfile(token as string, locale as "ar" | "en" | "de").catch(() => null)

      const [jobsResult, ticketsResult, profile] = await Promise.allSettled([
        jobsPromise,
        ticketsPromise,
        profilePromise,
      ])

      if (profile.status === "fulfilled" && profile.value) {
        profileLogo = getProfileCompanyLogo(profile.value)
        profileCompanyName = getProfileCompanyName(profile.value, locale)
      }

      if (jobsResult.status === "fulfilled") {
        const rawJobs = jobsResult.value.data ?? []
        const displayJobs = rawJobs.slice(0, 7)
        jobs = await enrichJobsWithApplicationCounts(
          displayJobs,
          token,
          locale as "ar" | "en" | "de"
        )

        // Prefer a quick upstream stats response (2.5s). If it's slow or fails,
        // compute stats using the enriched jobs list to avoid long blocking.
        try {
          const fast = await Promise.race([
            statsPromise,
            new Promise((res) => setTimeout(() => res("__SLOW__"), 2500)),
          ])
            if (fast !== "__SLOW__") {
              stats = fast as typeof stats
            } else {
              stats = await getCompanyStats(token, locale as "ar" | "en" | "de", jobs)
            }
            // If upstream returned zeros but we have jobs with application counts,
            // prefer computing an accurate fallback instead of showing misleading zeros.
            if (stats.total_applications === 0 && jobs.length > 0) {
              const computed = await getCompanyStats(token, locale as "ar" | "en" | "de", jobs)
              stats = computed
            }
        } catch {
          stats = await getCompanyStats(token, locale as "ar" | "en" | "de", jobs)
        }
      }

      if (ticketsResult.status === "fulfilled") {
        totalTickets =
          ticketsResult.value.meta?.total ??
          ticketsResult.value.data?.length ??
          0
      }
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    }
  }

  const tableRows: DashboardJobRow[] = jobs.slice(0, 7).map((job) => {
    const rawDeadline = resolveJobApplicationDeadline(job)
    const deadlineLabel = formatApplicationDeadline(rawDeadline, locale)
    return {
      id: job.id,
      title: getJobTitle(job, locale),
      column2: Number(job.applications_count) || 0,
      deadline: deadlineLabel,
      logo: resolveCompanyLogoForDisplay(job.company, profileLogo),
      companyName: job.company?.name ?? profileCompanyName,
      status: mapCompanyJobBadgeStatus(job.status) as DashboardJobRow["status"],
      rawStatus: job.status,
      detailsHref: `/dashboard/company/jobs/${job.id}`,
    }
  })

  return (
    <DashboardPageShell
      title={isAr ? "لوحة التحكم" : isDe ? "Dashboard" : "Dashboard"}
      description={isAr ? "إحصائيات عامة وإدارة الوظائف والتذاكر" : isDe ? "Übersicht über Statistiken, Stellenangebote und Tickets" : "Overview of stats, job posts, and support tickets"}
      isRTL={isAr}
    >
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-6 md:flex-row">
            <DashboardStatCard
              iconSrc="/dashboard/jobs.svg"
              title={isAr ? "إجمالي الوظائف" : isDe ? "Gesamte Jobs" : "Total Jobs"}
              value={stats.total_jobs}
              unit={isAr ? "وظيفة" : isDe ? (stats.total_jobs === 1 ? "Job" : "Jobs") : (stats.total_jobs === 1 ? "Job" : "Jobs")}
              viewAllHref="/dashboard/company/jobs"
              viewAllLabel={isAr ? "عرض الكل" : isDe ? "Alle anzeigen" : "View All"}
              locale={locale}
              isRTL={isAr}
            />
            <DashboardStatCard
              iconSrc="/dashboard/education_Info.svg"
              title={isAr ? "إجمالي المتقدمين" : isDe ? "Bewerber insgesamt" : "Total Applicants"}
              value={stats.total_applications}
              unit={isAr ? "طلب" : isDe ? (stats.total_applications === 1 ? "Bewerbung" : "Bewerbungen") : (stats.total_applications === 1 ? "Application" : "Applications")}
              viewAllHref="/dashboard/company/applicants"
              viewAllLabel={isAr ? "عرض الكل" : isDe ? "Alle anzeigen" : "View All"}
              locale={locale}
              isRTL={isAr}
            />
            <DashboardStatCard
              iconSrc="/dashboard/tickets.svg"
              title={isAr ? "إجمالي التذاكر" : isDe ? "Tickets insgesamt" : "Total Tickets"}
              value={totalTickets}
              unit={isAr ? "تذكرة" : isDe ? (totalTickets === 1 ? "Ticket" : "Tickets") : (totalTickets === 1 ? "Ticket" : "Tickets")}
              viewAllHref="/dashboard/company/tickets"
              viewAllLabel={isAr ? "عرض الكل" : isDe ? "Alle anzeigen" : "View All"}
              locale={locale}
              isRTL={isAr}
            />
          </div>
        </div>

        <DashboardJobsTable
          title={isAr ? "آخر الوظائف" : isDe ? "Aktuelle Jobs" : "Recent Jobs"}
          rows={tableRows}
          col2Label={isAr ? "المتقدمون" : isDe ? "Bewerber" : "Applied Candidate"}
          jobTitleLabel={isAr ? "عنوان الوظيفة" : isDe ? "Jobtitel" : "Job Title"}
          deadlineLabel={isAr ? "الموعد النهائي" : isDe ? "Frist" : "Deadline"}
          statusLabel={isAr ? "الحالة" : isDe ? "Status" : "Status"}
          actionsLabel={isAr ? "الإجراءات" : isDe ? "Aktionen" : "Actions"}
          emptyMessage={isAr ? "لا توجد وظائف" : isDe ? "Keine Jobs gefunden" : "No jobs found"}
          detailsLabel={isAr ? "تفاصيل" : isDe ? "Einzelheiten" : "Details"}
          locale={locale}
          isRTL={isAr}
          showCompanyActions
        />

        {tableRows.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            {isAr ? "لا توجد وظائف بعد — " : isDe ? "Noch keine Jobs — " : "No jobs yet — "}
            <Link
              locale={locale}
              href="/dashboard/company/jobs/create"
              className="font-semibold text-[#006EA8] hover:underline"
            >
              {isAr ? "أنشئ وظيفة" : isDe ? "Job erstellen" : "Create a job"}
            </Link>
          </p>
        )}
      </div>
    </DashboardPageShell>
  )
}
