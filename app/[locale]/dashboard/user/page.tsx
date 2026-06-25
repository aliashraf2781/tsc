import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getMyApplications } from "@/lib/api/services/user.service"
import { getFavoriteJobs } from "@/lib/api/services/jobs.service"
import { getTickets } from "@/lib/api/services/tickets.service"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "user") {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken!
  const isAr = locale === "ar"
  const isDe = locale === "de"

  let applications: any[] = []
  let totalApplications = 0
  let totalFavorites = 0
  let totalTickets = 0

  try {
    const [appsData, favoritesData, ticketsData] = await Promise.all([
      getMyApplications(token, 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
      getFavoriteJobs(token, locale).catch(() => []),
      getTickets(token, 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
    ])
    applications = appsData.data ?? []
    totalApplications = appsData.meta?.total ?? applications.length
    totalFavorites = favoritesData.length
    totalTickets = ticketsData.meta?.total ?? ticketsData.data?.length ?? 0
  } catch (_err) {
    // graceful fallback
  }

  const tableRows = applications.slice(0, 7).map((app) => ({
    id: app.id,
    title: app.job ? getJobTitle(app.job, locale) : "—",
    column2: app.job?.company?.name ?? "—",
    deadline: (() => {
      const j = app.job || {}
      const candidates = [
        j.application_deadline,
        j.applicationDeadline,
        app.application_deadline,
        app.applicationDeadline,
        j.deadline,
        j.deadline_at,
        j.deadlineDate,
        j.expires_at,
      ]
      const found = candidates.find((c) => !!c)
      if (!found) return "—"
      try {
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(found))
      } catch {
        return "—"
      }
    })(),
    status: (app.status === "accepted"
      ? "accepted"
      : app.status === "approved"
        ? "approved"
        : app.status === "rejected"
          ? "rejected"
          : "pending") as "approved" | "rejected" | "pending" | "accepted",
    detailsHref: `/dashboard/user/applications/${app.id}`,
  }))

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <DashboardStatCard
          iconSrc="/dashboard/jobs.svg"
          title={isAr ? "إجمالي طلبات الوظائف" : isDe ? "Gesamte Bewerbungen" : "Total Jobs Apply"}
          value={totalApplications}
          unit={isAr ? "Job" : "Job"}
          viewAllHref="/dashboard/user/applications"
          viewAllLabel={isAr ? "عرض الكل" : isDe ? "Alle anzeigen" : "View All"}
          isRTL={isAr}
        />
        <DashboardStatCard
          iconSrc="/dashboard/favourites.svg"
          title={isAr ? "الوظائف المفضلة" : isDe ? "Lieblingsjobs" : "Total Favourite Jobs"}
          value={totalFavorites}
          unit={isAr ? "Job" : "Job"}
          viewAllHref="/dashboard/user/favourites"
          viewAllLabel={isAr ? "عرض الكل" : isDe ? "Alle anzeigen" : "View All"}
          isRTL={isAr}
        />
        <DashboardStatCard
          iconSrc="/dashboard/tickets.svg"
          title={isAr ? "إجمالي التذاكر" : isDe ? "Gesamte Tickets" : "Total Ticket"}
          value={totalTickets}
          unit={isAr ? "ticket" : "ticket"}
          viewAllHref="/dashboard/user/tickets"
          viewAllLabel={isAr ? "عرض الكل" : isDe ? "Alle anzeigen" : "View All"}
          isRTL={isAr}
        />
      </div>

      <DashboardJobsTable
        title={isAr ? "آخر طلبات التوظيف" : isDe ? "Letzte Bewerbungen" : "Last Job Application"}
        rows={tableRows}
        locale={locale}
        col2Label={isAr ? "اسم الشركة" : isDe ? "Firmenname" : "Company Name"}
        jobTitleLabel={isAr ? "عنوان الوظيفة" : isDe ? "Jobtitel" : "Job Title"}
        deadlineLabel={isAr ? "الموعد النهائي" : isDe ? "Frist" : "Deadline"}
        statusLabel={isAr ? "الحالة" : isDe ? "Status" : "Status"}
        actionsLabel={isAr ? "الإجراءات" : isDe ? "Aktionen" : "Actions"}
        emptyMessage={isAr ? "لا توجد طلبات حتى الآن" : isDe ? "Noch keine Bewerbungen" : "No applications yet"}
        detailsLabel={isAr ? "تفاصيل" : isDe ? "Details" : "Details"}
        isRTL={isAr}
      />
    </div>
  )
}
