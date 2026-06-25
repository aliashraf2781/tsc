import { CompanyAvatar } from "@/features/company-profile/components/company-avatar"
import { Link } from "@/i18n/navigation"
import type { Job } from "@/lib/api/types"
import { formatPostedLabel, getJobTitle, getLocalizedName, getJobCompanyLogo } from "@/features/jobs/lib/job-display"

type RelatedJobCardProps = {
  job: Job
  locale: string
  postedAgoFallback: string
  companySubLabel: string
}

export function RelatedJobCard({
  job,
  locale,
  postedAgoFallback,
  companySubLabel,
}: RelatedJobCardProps) {
  const title = getJobTitle(job, locale)
  const industry =
    getLocalizedName(job.company?.company_type?.name || job.category?.name, locale) || companySubLabel
  const posted = formatPostedLabel(job, locale, postedAgoFallback)
  const companyLogo = getJobCompanyLogo(job)

  return (
    <Link
      locale={locale}
      href={`/jobs/${job.id}`}
      className="flex min-h-[117px] flex-col justify-between rounded-[8px] border border-[#e8f2ff] bg-white p-4 transition hover:border-[#78a3be] hover:shadow-[0_4px_16px_rgba(0,43,70,0.06)]"
    >
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-[20px] font-bold leading-[1.16] text-[#262626]">{title}</h4>
        <span className="shrink-0 text-[16px] leading-[1.16] text-[#525252]">{posted}</span>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <CompanyAvatar logo={companyLogo} name={job.company?.name} className="size-[38px] border border-[#e8f2ff]" />
        <div className="min-w-0 text-start">
          <p className="truncate text-[16px] font-bold leading-[1.16] text-[#262626]">
            {job.company?.name ?? "—"}
          </p>
          <p className="truncate text-[12px] leading-[1.16] text-[#525252]">{industry}</p>
        </div>
      </div>
    </Link>
  )
}
