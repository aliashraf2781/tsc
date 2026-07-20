import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import type { JobApplication } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { getCompanyLogo } from "@/features/jobs/lib/job-display"
import { formatApplicationDateTime } from "../lib/format"
import { getApplicationStatusLabel, getApplicationStatusStyle } from "../lib/status"
import type { ApplicationDetailLabels } from "../lib/labels"
import type { AppLocale } from "../lib/types"

export function ApplicationOverviewCard({
  application,
  locale,
  labels,
}: {
  application: JobApplication
  locale: AppLocale
  labels: ApplicationDetailLabels
}) {
  const jobTitle = application.job ? getJobTitle(application.job, locale) : "—"
  const companyName = application.job?.company?.name || "—"
  const companyLogo = getCompanyLogo(application.job?.company)
  const status = application.status || "pending"
  const statusStyle = getApplicationStatusStyle(status)
  const statusLabel = getApplicationStatusLabel(status, locale)

  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div className="space-y-2">
            <h2 className="text-[22px] font-bold text-[#032C44]">{jobTitle}</h2>
            <div className="flex items-center gap-2">
              {companyLogo && (
                <img
                  src={companyLogo}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-gray-100"
                />
              )}
              <span className="text-[15px] text-[#6B7280] font-medium">{companyName}</span>
            </div>
          </div>

          <span
            className={cn(
              "self-start px-4 py-1.5 rounded-full text-[12px] font-bold border",
              statusStyle.bg,
              statusStyle.text,
              statusStyle.border
            )}
          >
            {statusLabel}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
              {labels.appliedOn}
            </p>
            <div className="flex items-center gap-2 text-[#032C44]">
              <img src="/portfolio/calender.svg" alt="" className="w-4 h-4 opacity-60" />
              <span className="font-medium">{formatApplicationDateTime(application.applied_at, locale)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
              {labels.status}
            </p>
            <p className="font-medium text-[#032C44]">{statusLabel}</p>
          </div>
        </div>

        {application.job?.id && (
          <div className="flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row">
            <Link
              href={`/jobs/${application.job.id}`}
              className="inline-flex items-center justify-center h-[44px] px-6 bg-gradient-to-b from-[#006EA8] to-[#005685] text-white font-bold rounded-[12px] text-[14px] transition hover:brightness-105 shadow-[inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF] w-full sm:w-auto"
            >
              {labels.viewJob}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
