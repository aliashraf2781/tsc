"use client"

import { Link, useRouter } from "@/i18n/navigation"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { useTranslations } from "next-intl"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { pickLocalizedName } from "@/features/admin/lib/localized-name"
import { formatJobSalaryRange } from "@/features/jobs/lib/job-display"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { AdminJobQuickActions } from "./admin-job-quick-actions"
import { cn } from "@/lib/utils"

export function AdminDashboardOverview({
  stats,
  pendingJobs,
  locale,
}: {
  stats: {
    total_users: number
    total_companies: number
    total_jobs: number
    pending_jobs: number
    published_jobs: number
  }
  pendingJobs: Job[]
  locale: string
}) {
  const t = useTranslations("Admin.dashboard")
  const tJobs = useTranslations("Admin.jobs")
  const router = useRouter()


  const kpis = [
    {
      label: t("kpi.users"),
      value: stats.total_users,
      href: "/dashboard/admin/users",
      icon: "/dashboard/profile.svg",
      viewAllLabel: t("viewAll"),
    },
    {
      label: t("kpi.companies"),
      value: stats.total_companies,
      href: "/dashboard/admin/companies",
      icon: "/dashboard/education_Info.svg",
      viewAllLabel: t("viewAll"),
    },
    {
      label: tJobs("summary.published"),
      value: stats.published_jobs,
      href: "/dashboard/admin/jobs?status=approved",
      icon: "/dashboard/jobs.svg",
      viewAllLabel: t("viewAll"),
    },
    {
      label: t("kpi.pending"),
      value: stats.pending_jobs,
      href: "/dashboard/admin/jobs?status=pending",
      icon: "/dashboard/tickets.svg",
      viewAllLabel: t("viewAll"),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <DashboardStatCard
            key={kpi.label}
            iconSrc={kpi.icon}
            title={kpi.label}
            value={kpi.value}
            viewAllHref={kpi.href}
            viewAllLabel={kpi.viewAllLabel}
            locale={locale}
            isRTL={locale === "ar"}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className={cn(
          "flex items-center justify-between px-6 py-4 text-white",
          locale === "ar" ? "bg-gradient-to-r" : "bg-gradient-to-l",
          "from-[#032C44] to-[#41A0CA]"
        )}>
          <h2 className="text-[15px] font-bold text-white">{t("pendingTable")}</h2>
          <Link
            locale={locale}
            href="/dashboard/admin/jobs?status=pending"
            className="text-[13px] font-semibold text-[#B8E6F7] hover:text-white"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#EBF5FB]">
                {[
                  tJobs("columns.title"),
                  tJobs("columns.company"),
                  tJobs("columns.category"),
                  tJobs("columns.salary"),
                  tJobs("columns.status"),
                  tJobs("columns.actions")
                ].map(
                  (h) => (
                    <th key={h} className="px-6 py-3 text-start text-[13px] font-semibold text-[#374151]">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pendingJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[14px] text-[#9CA3AF]">
                    {t("noPending")}
                  </td>
                </tr>
              ) : (
                pendingJobs.slice(0, 5).map((job, idx) => (
                  <tr
                    key={job.id}
                    onClick={() => router.push(`/dashboard/admin/jobs/${job.id}`)}
                    className={cn(
                      "cursor-pointer hover:bg-[#F2F8FC] transition-colors",
                      idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                    )}
                  >
                    <td className="px-6 py-4 text-[14px] font-medium">{getJobTitle(job, locale)}</td>
                    <td className="px-6 py-4 text-[14px]">{job.company?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280]">
                      {pickLocalizedName(job.category?.name, locale)}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#374151]">
                      {formatJobSalaryRange(job)}
                    </td>
                    <td className="px-6 py-4">
                      <DashboardStatusBadge status="pending" label={t("status.pending")} />
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <AdminJobQuickActions jobId={job.id} locale={locale} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
