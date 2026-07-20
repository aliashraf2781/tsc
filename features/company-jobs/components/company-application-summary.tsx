import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { CloudDownload } from "lucide-react"
import {
  getApplicantDisplayName,
  mapApplicationStatus,
  normalizePortfolioShape,
  type CompanyApplication,
} from "@/features/company-jobs/lib/application-utils"
import { formatApplicationDate } from "@/features/company-jobs/lib/company-application-format"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import type { CompanyApplicationDetailLabels } from "@/features/company-jobs/lib/company-application-detail-labels"

type CompanyApplicationSummaryProps = {
  application: CompanyApplication
  jobTitle: string
  locale: string
  labels: CompanyApplicationDetailLabels
  maskApplicantName: boolean
  userProfileHref?: string
}

export function CompanyApplicationSummary({
  application,
  jobTitle,
  locale,
  labels,
  maskApplicantName,
  userProfileHref,
}: CompanyApplicationSummaryProps) {
  const applicantName = getApplicantDisplayName(application, {
    mask: maskApplicantName,
    unknownLabel: labels.unknownCandidate,
  })
  const portfolio = normalizePortfolioShape(application.userPortfolio || {})
  const status = mapApplicationStatus(application.status)
  const cvUrl = application.cv_url || portfolio.cv
  const location = [application.user?.city?.name, application.user?.country?.name].filter(Boolean).join(", ")
  const appliedAt = formatApplicationDate(application.applied_at, locale)
  const jobStatus = application.job?.status

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] pb-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#DCEBFF] bg-[#F5F9FC]">
          {application.user?.avatar ? (
            <Image src={application.user.avatar} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#006EA8]">
              {(applicantName || "?").charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold text-[#032C44]">{applicantName || labels.unknownCandidate}</h1>
          <p className="mt-1 text-sm text-[#525252]">{location || "—"}</p>
          <p className="mt-1 text-xs text-[#6B7280]">{jobTitle}</p>
          {appliedAt !== "—" ? (
            <p className="mt-1 text-xs text-[#6B7280]">
              {labels.appliedOn}: {appliedAt}
            </p>
          ) : null}
          {userProfileHref ? (
            <Link
              href={userProfileHref}
              className="mt-2 inline-flex text-xs font-semibold text-[#006EA8] hover:underline"
            >
              {labels.viewApplicantProfile}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DashboardStatusBadge status={status} locale={locale} />
        {jobStatus ? (
          <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            {labels.jobStatus}:
            <DashboardStatusBadge status={jobStatus} locale={locale} />
          </span>
        ) : null}
        {cvUrl ? (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#006EA8] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,110,168,0.28)] transition hover:bg-[#005685]"
          >
            <CloudDownload className="h-4 w-4" aria-hidden />
            {labels.downloadCv}
          </a>
        ) : null}
      </div>
    </div>
  )
}
