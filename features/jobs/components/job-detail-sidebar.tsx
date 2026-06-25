import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import type { Job } from "@/lib/api/types"
import {
  formatAgeRange,
  formatApplicationDeadline,
  formatDetailEmployment,
  formatGenderForDetail,
  formatJobSalaryRange,
  getLocalizedName,
  resolveJobApplicationDeadline,
} from "@/features/jobs/lib/job-display"
import { RelatedJobCard } from "@/features/jobs/components/related-job-card"
import ApplyButton from "@/features/jobs/components/apply-button"
import { FavoriteButton } from "@/features/jobs/components/favorite-button"
import { JobActionButton } from "./job-action-button"

type JobDetailSidebarProps = {
  job: Job
  locale: string
  relatedJobs: Job[]
  labels: {
    monthly: string
    details: string
    industry: string
    employmentType: string
    vacancy: string
    gender: string
    age: string
    applicationDeadline: string
    applyForJob: string
    relatedJobs: string
    postedAgo: string
    companySubLabel: string
  }
  applyHref?: string
  initialIsFavorite?: boolean
  isCompanyView?: boolean
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-8 px-2 py-0">
      <span className="text-[16px] leading-[1.16] text-[#A3A3A3]">{label}</span>
      <span className="text-end text-[16px] font-semibold leading-[1.16] text-[#525252]">
        {value}
      </span>
    </div>
  )
}

export function JobDetailSidebar({
  job,
  locale,
  relatedJobs,
  labels,
  applyHref = "/sign-in",
  initialIsFavorite = false,
  isCompanyView = false,
}: JobDetailSidebarProps) {
  const industry = getLocalizedName(job.company?.company_type?.name || job.category?.name, locale)
  const employment = formatDetailEmployment(job, locale)
  const salaryRange = formatJobSalaryRange(job, locale === "ar")
  const ageRange = formatAgeRange(job, locale)
  const rawDeadline = resolveJobApplicationDeadline(job)
  const deadline = formatApplicationDeadline(rawDeadline, locale)
  const genderLabel = job.gender ? formatGenderForDetail(job.gender, locale) : null

  const showSalary = salaryRange !== "—"
  const showIndustry = Boolean(industry?.trim())
  const showEmployment = Boolean(employment)
  const showVacancy = job.vacancy != null
  const showGender = Boolean(genderLabel)
  const showAge = ageRange !== "—"
  const showDeadline = Boolean(rawDeadline && String(rawDeadline).trim())

  const hasDetails =
    showIndustry ||
    showEmployment ||
    showVacancy ||
    showGender ||
    showAge ||
    showDeadline

  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[16px] border border-[#78A3BE]/40 bg-white p-8 shadow-[0_8px_32px_rgba(0,43,70,0.06)]">
        {showSalary ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[26px] font-bold leading-[1.2] text-[#262626] sm:text-[32px]" dir="ltr">
                {salaryRange}
              </p>
              <p className="mt-1 text-[14px] font-medium leading-[1.16] text-[#525252]">
                {labels.monthly}
              </p>
            </div>
            {!isCompanyView && (
              <FavoriteButton jobId={job.id} locale={locale} initialIsFavorite={initialIsFavorite} />
            )}
          </div>
        ) : (
          !isCompanyView && (
            <div className="flex justify-end">
              <FavoriteButton jobId={job.id} locale={locale} initialIsFavorite={initialIsFavorite} />
            </div>
          )
        )}

        {hasDetails ? (
          <>
            <h3 className="mt-8 text-[12px] leading-[1.16] text-[#A3A3A3]">{labels.details}</h3>
            <div className="mt-6 flex flex-col gap-5">
              {showIndustry ? <DetailRow label={labels.industry} value={industry!} /> : null}
              {showEmployment ? (
                <DetailRow label={labels.employmentType} value={employment!} />
              ) : null}
              {showVacancy ? (
                <DetailRow label={labels.vacancy} value={String(job.vacancy)} />
              ) : null}
              {showGender ? <DetailRow label={labels.gender} value={genderLabel!} /> : null}
              {showAge ? <DetailRow label={labels.age} value={ageRange} /> : null}
              {showDeadline ? <DetailRow label={labels.applicationDeadline} value={deadline} /> : null}
            </div>
          </>
        ) : null}

        {/* Client-side apply button or company view button */}
        {isCompanyView ? (
          <PrimaryButton asChild className="mt-8">
            <Link locale={locale} href={applyHref}>
              {labels.applyForJob}
            </Link>
          </PrimaryButton>
        ) : (
          <JobActionButton
            jobId={job.id}
            companyId={job.company?.id}
            locale={locale}
            applyLabel={labels.applyForJob}
          />
        )}

      </div>

      {relatedJobs.length > 0 ? (
        <div className="flex flex-col gap-8">
          <h3 className="text-[32px] font-semibold leading-[1.5] text-[#002B46]">
            {labels.relatedJobs}
          </h3>
          <div className="flex flex-col gap-4">
            {relatedJobs.map((related) => (
              <RelatedJobCard
                key={related.id}
                job={related}
                locale={locale}
                postedAgoFallback={labels.postedAgo}
                companySubLabel={labels.companySubLabel}
              />
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
