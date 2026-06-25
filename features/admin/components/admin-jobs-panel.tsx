"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Eye, Search } from "lucide-react"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { pickLocalizedName } from "@/features/admin/lib/localized-name"
import { formatJobSalaryRange, resolveJobCreatedAt } from "@/features/jobs/lib/job-display"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { AdminJobActionsMenu } from "@/features/admin/components/admin-job-actions-menu"
import { Input } from "@/components/ui/input"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"

type Tab = "pending" | "approved" | "rejected" | "all"

function mapStatusForTab(status: string): "pending" | "approved" | "rejected" {
  if (status === "approved" || status === "active" || status === "stopped" || status === "closed") return "approved"
  if (status === "rejected") return "rejected"
  return "pending"
}

function mapStatusForBadge(status: string): "pending" | "approved" | "rejected" | "stopped" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  if (status === "stopped" || status === "closed") return "stopped"
  return "pending"
}

function formatPublishDate(job: Job, locale: string): string {
  const raw = resolveJobCreatedAt(job)
  if (!raw) return "—"
  try {
    return new Date(raw).toLocaleDateString(locale === "ar" ? "ar-EG-u-nu-latn" : locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

export function AdminJobsPanel({
  jobs,
  initialTab = "all",
  serverCounts,
}: {
  jobs: Job[]
  locale: string
  initialTab?: Tab
  serverCounts?: { total: number; pending: number; approved: number; rejected: number }
}) {
  const t = useTranslations("Admin.jobs")
  const tDashboard = useTranslations("Admin.dashboard")
  const router = useRouter()
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAppliedSearch(search.trim())
  }

  const filtered = useMemo(() => {
    let list = tab === "all" ? jobs : jobs.filter((j) => mapStatusForTab(j.status) === tab)

    const query = appliedSearch.toLowerCase()
    if (query) {
      list = list.filter((job) => {
        const title = getJobTitle(job, locale).toLowerCase()
        const company = (job.company?.name ?? "").toLowerCase()
        const category = pickLocalizedName(job.category?.name, locale).toLowerCase()
        return title.includes(query) || company.includes(query) || category.includes(query)
      })
    }

    return [...list].sort((a, b) => {
      const ta = resolveJobCreatedAt(a)
      const tb = resolveJobCreatedAt(b)
      const timeA = ta ? new Date(ta).getTime() : 0
      const timeB = tb ? new Date(tb).getTime() : 0
      return timeB - timeA
    })
  }, [jobs, tab, appliedSearch, locale])

  const statusCounts = useMemo(() => {
    if (serverCounts) return serverCounts

    return {
      total: jobs.length,
      pending: jobs.filter((job) => mapStatusForTab(job.status) === "pending").length,
      approved: jobs.filter((job) => mapStatusForTab(job.status) === "approved").length,
      rejected: jobs.filter((job) => mapStatusForTab(job.status) === "rejected").length,
    }
  }, [jobs, serverCounts])

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: t("tabs.all") },
    { id: "pending", label: t("tabs.pending") },
    { id: "approved", label: t("tabs.approved") },
    { id: "rejected", label: t("tabs.rejected") },
  ]

  const columns = [
    { key: "title", label: t("columns.title"), className: "w-[18%]" },
    { key: "company", label: t("columns.company"), className: "w-[14%]" },
    { key: "category", label: t("columns.category"), className: "w-[12%]" },
    { key: "publishedAt", label: t("columns.publishedAt"), className: "w-[12%]" },
    { key: "applicants", label: t("columns.applicants"), className: "w-[8%]" },
    { key: "salary", label: t("columns.salary"), className: "w-[12%]" },
    { key: "status", label: t("columns.status"), className: "w-[10%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[14%]" },
  ]

  const statusLabels: Record<string, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
    stopped: isRTL ? "موقوفة" : "Stopped",
  }

  const summaryCards: { key: Tab; label: string; value: number; icon: string }[] = [
    { key: "all", label: t("summary.total"), value: statusCounts.total, icon: "/dashboard/jobs.svg" },
    { key: "pending", label: t("summary.pending"), value: statusCounts.pending, icon: "/dashboard/tickets.svg" },
    { key: "approved", label: t("summary.published"), value: statusCounts.approved, icon: "/dashboard/education_Info.svg" },
    { key: "rejected", label: t("summary.rejected"), value: statusCounts.rejected, icon: "/dashboard/logout.svg" },
  ]

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab)
    router.push(`/dashboard/admin/jobs?status=${nextTab}`)
  }

  return (
    <div className={cn("flex flex-col gap-4", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <DashboardStatCard
            key={card.key}
            iconSrc={card.icon}
            title={card.label}
            value={card.value}
            viewAllHref={`/dashboard/admin/jobs?status=${card.key}`}
            viewAllLabel={tDashboard("viewAll")}
            locale={locale}
            isRTL={isRTL}
            onCardClick={() => handleTabChange(card.key)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto sm:justify-start">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === item.id
                  ? isRTL
                    ? "bg-gradient-to-r from-[#032C44] to-[#41A0CA] text-white"
                    : "bg-gradient-to-l from-[#032C44] to-[#41A0CA] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full max-w-[644px] flex-row items-center gap-2 sm:max-w-md"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className={cn(
                "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-[#737373]",
                isRTL ? "left-3" : "left-3"
              )}
              aria-hidden
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                const val = e.target.value
                setSearch(val)
                if (!val.trim()) setAppliedSearch("")
              }}
              placeholder={t("searchPlaceholder")}
              className="h-[44px] w-full rounded-[12px] border border-[#40A0CA] ps-10 pe-4 text-[14px] text-[#171717] placeholder:text-[#737373]/80 focus:border-[#006EA8] focus:ring-1 focus:ring-[#006EA8] shadow-sm"
              style={{
                background:
                  "linear-gradient(180deg,rgba(0,110,168,0.12) 0%,rgba(0,86,133,0.12) 100%)",
              }}
            />
          </div>
          <PrimaryButton
            type="submit"
            className="h-[44px] w-11 shrink-0 rounded-[12px] px-0 sm:w-[120px] sm:px-4"
          >
            <Search className="size-5 shrink-0" />
            <span className="hidden sm:inline">{t("search")}</span>
          </PrimaryButton>
        </form>
      </div>

      <AdminTableShell
        columns={columns}
        isEmpty={filtered.length === 0}
        emptyMessage={t("empty")}
        isRTL={isRTL}
      >
        {filtered.map((job, index) => {
          const status = mapStatusForBadge(job.status)
          const salary = formatJobSalaryRange(job)

          return (
            <AdminTableRow
              key={job.id}
              striped={index % 2 === 1}
              onClick={() => router.push(`/dashboard/admin/jobs/${job.id}`)}
            >
              <AdminTableCell className="w-[18%] font-medium">
                {getJobTitle(job, locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[14%]">
                {job.company?.name ?? "—"}
              </AdminTableCell>
              <AdminTableCell className="w-[12%]">
                {pickLocalizedName(job.category?.name, locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[12%] text-sm font-medium">
                {formatPublishDate(job, locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[8%] text-sm font-medium">
                {job.applications_count ?? 0}
              </AdminTableCell>
              <AdminTableCell className="w-[12%]">{salary}</AdminTableCell>
              <AdminTableCell className="w-[10%]">
                <DashboardStatusBadge
                  status={status}
                  label={statusLabels[status]}
                  locale={locale}
                />
              </AdminTableCell>
              <AdminTableCell className="w-[14%]">
                <div
                  className={cn("flex flex-wrap items-center gap-2", isRTL && "flex-row-reverse")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    locale={locale}
                    href={`/dashboard/admin/jobs/${job.id}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-[#DCEBFF] bg-[#F6FBFF] text-[#006EA8] hover:bg-[#EAF6FF]"
                    aria-label={t("viewDetails")}
                    title={t("viewDetails")}
                  >
                    <Eye className="size-4" />
                  </Link>
                  <AdminJobActionsMenu jobId={job.id} locale={locale} status={job.status} />
                </div>
              </AdminTableCell>
            </AdminTableRow>
          )
        })}
      </AdminTableShell>
    </div>
  )
}
