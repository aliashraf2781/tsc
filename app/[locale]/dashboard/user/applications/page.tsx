// app/[locale]/dashboard/user/applications/page.tsx
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { getMyApplications } from "@/lib/api/services/user.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"

function formatApplicationDate(value: string | undefined, locale: string) {
  if (!value) return "—"

  try {
    const formatter =
      locale === "ar"
        ? new Intl.DateTimeFormat("ar-EG")
        : locale === "de"
          ? new Intl.DateTimeFormat("de-DE")
          : new Intl.DateTimeFormat("en-GB")

    return formatter.format(new Date(value))
  } catch {
    return "—"
  }
}

export default async function UserApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const isAr = locale === "ar"
  const isDe = locale === "de"

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const labels = {
    title: isAr ? "طلباتي للوظائف" : isDe ? "Meine Bewerbungen" : "My job applications",
    description: isAr
      ? "تابع جميع الطلبات والنتائج في مكان واحد"
      : isDe
        ? "Verfolgen Sie jede Bewerbung und ihren aktuellen Status an einem Ort"
        : "Track every application and its current status in one place",
    empty: isAr ? "لم تقدم على أي وظائف بعد" : isDe ? "Sie haben sich noch auf keine Stellen beworben" : "You have not applied to any jobs yet",
    total: isAr ? "إجمالي الطلبات" : isDe ? "Bewerbungen insgesamt" : "Total applications",
    pending: isAr ? "طلبات معلقة" : isDe ? "Ausstehend" : "Pending",
    accepted: isAr ? "طلبات مقبولة" : isDe ? "Akzeptiert" : "Accepted",
    rejected: isAr ? "طلبات مرفوضة" : isDe ? "Abgelehnt" : "Rejected",
    viewAll: isAr ? "عرض الكل" : isDe ? "Alle anzeigen" : "View all",
    details: isAr ? "تفاصيل" : isDe ? "Details" : "Details",
    company: isAr ? "اسم الشركة" : isDe ? "Name des Unternehmens" : "Company Name",
    jobTitle: isAr ? "عنوان الوظيفة" : isDe ? "Stellentitel" : "Job Title",
    deadline: isAr ? "تاريخ التقديم" : isDe ? "Beworben am" : "Applied On",
    status: isAr ? "الحالة" : isDe ? "Status" : "Status",
    actions: isAr ? "الإجراءات" : isDe ? "Aktionen" : "Actions",
  }

  const appsResult = await getMyApplications(session.accessToken, 1, locale as "ar" | "en" | "de")
    .catch(() => ({ data: [], meta: { total: 0 } }))
  const applications = appsResult.data ?? []
  const totalApplications = appsResult.meta?.total ?? applications.length

  const statusCounts = applications.reduce(
    (acc, app) => {
      if (app.status === "accepted" || app.status === "approved") acc.accepted += 1
      else if (app.status === "rejected") acc.rejected += 1
      else acc.pending += 1
      return acc
    },
    { pending: 0, accepted: 0, rejected: 0 }
  )

  const rows = applications.map((app) => ({
    id: app.id,
    title: app.job ? getJobTitle(app.job, locale as "ar" | "en" | "de") : "—",
    column2: app.job?.company?.name ?? "—",
    deadline: formatApplicationDate(app.applied_at, locale),
    logo: (app.job?.company as any)?.logo ?? (app.job?.company as any)?.logo_url ?? (app.job?.company as any)?.avatar ?? null,
    companyName: app.job?.company?.name ?? undefined,
    status: (app.status === "accepted"
      ? "accepted"
      : app.status === "approved"
        ? "approved"
        : app.status === "rejected"
          ? "rejected"
          : "pending") as any,
    detailsHref: `/dashboard/user/applications/${app.id}`,
  }))

  return (
    <DashboardPageShell title={labels.title} description={labels.description} isRTL={isAr}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <DashboardStatCard
            iconSrc="/dashboard/jobs.svg"
            title={labels.total}
            value={totalApplications}
            isRTL={isAr}
          />
          <DashboardStatCard
            iconSrc="/dashboard/favourites.svg"
            title={labels.pending}
            value={statusCounts.pending}
            isRTL={isAr}
          />
          <DashboardStatCard
            iconSrc="/dashboard/tickets.svg"
            title={labels.accepted}
            value={statusCounts.accepted}
            isRTL={isAr}
          />
          <DashboardStatCard
            iconSrc="/dashboard/jobs.svg"
            title={labels.rejected}
            value={statusCounts.rejected}
            isRTL={isAr}
          />
        </div>

        <DashboardJobsTable
          title={labels.title}
          rows={rows}
          col2Label={labels.company}
          emptyMessage={labels.empty}
          detailsLabel={labels.details}
          locale={locale}
          isRTL={isAr}
          jobTitleLabel={labels.jobTitle}
          deadlineLabel={labels.deadline}
          statusLabel={labels.status}
          actionsLabel={labels.actions}
        />
      </div>
    </DashboardPageShell>
  )
}
