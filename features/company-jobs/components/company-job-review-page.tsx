import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getCompanyJob } from "@/lib/api/services/company.service"
import { getProfile } from "@/lib/api/services/auth.service"
import { localizedField } from "@/features/company-jobs/lib/localized-field"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { getProfileCompanyLogo } from "@/features/company-profile/lib/profile-logo"
import { JobDetailHero } from "@/features/jobs/components/job-detail-hero"
import { JobDetailSidebar } from "@/features/jobs/components/job-detail-sidebar"
import { JobDetailShare } from "@/features/jobs/components/job-detail-share"
import { formatPostedLabel, getLocalizedStateName } from "@/features/jobs/lib/job-display"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"

type CompanyJobReviewPageProps = {
  jobId: number
  locale: string
  accessToken: string
}

function renderSectionBody(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return null
  return trimmed.split(/\n{2,}/).map((paragraph, index) => (
    <p key={index} className="text-[16px] leading-[1.5] text-[#525252]">
      {paragraph.trim()}
    </p>
  ))
}

export async function CompanyJobReviewPage({
  jobId,
  locale,
  accessToken,
}: CompanyJobReviewPageProps) {
  const isRtl = locale === "ar"
  const t = await getTranslations("CompanyJobs")
  const jobsT = await getTranslations("Landing.jobsPage")

  const [job, profile] = await Promise.all([
    getCompanyJob(jobId, accessToken, locale),
    getProfile(accessToken, locale).catch(() => null),
  ])

  if (!job) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Link
          locale={locale}
          href="/dashboard/company/jobs"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#006EA8] hover:underline"
        >
          {t("review.backToJobs")}
        </Link>
        <div className="rounded-[8px] bg-white p-10 text-center shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)]">
          <p className="text-[16px] text-[#525252]">{t("review.notFound")}</p>
        </div>
      </div>
    )
  }

  const title = getJobTitle(job, locale)
  const description = localizedField(job.description, locale)
  const requirements = localizedField(job.requirements, locale)
  const responsibilities = localizedField(job.responsibilities, locale)
  const location = getLocalizedStateName(job.state || "", locale) || job.city?.name || job.location || ""
  const postedLabel = formatPostedLabel(job, locale, jobsT("postedAgo"))
  const companyName = job.company?.name ?? t("review.companyFallback")

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        locale={locale}
        href="/dashboard/company/jobs"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#006EA8] hover:underline"
      >
        {t("review.backToJobs")}
      </Link>

      <div className="overflow-hidden rounded-[8px] bg-white shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)]">
        <JobDetailHero
          job={job}
          companyName={companyName}
          industryFallback={job.category?.name ?? t("review.industryFallback")}
        />

        <div className="px-4 pb-10 pt-8 sm:px-8 lg:px-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className={cn(
              "bg-clip-text text-[24px] font-bold leading-[1.16] text-transparent",
              isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l",
              "from-[#032C44] to-[#41A0CA]"
            )}>
              {t("review.title")}
            </h1>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,421px)] lg:justify-between lg:gap-10">
            <div className="min-w-0 space-y-8 text-start">
              <header className="flex flex-col gap-4">
                <p className="text-[16px] leading-[1.16] text-[#525252]">
                  {jobsT("detail.lookingFor")}
                </p>
                <h2 className="text-[32px] font-bold leading-[1.5] text-[#262626] sm:text-[40px]">
                  {title}
                </h2>
                {(location || postedLabel) && (
                  <p className="flex flex-wrap items-center gap-2 text-[16px] leading-[1.16] text-[#525252]">
                    {location ? <span>{location}</span> : null}
                    {location && postedLabel ? (
                      <span className="inline-block size-2 rounded-full bg-[#525252]" aria-hidden />
                    ) : null}
                    {postedLabel ? <span>{postedLabel}</span> : null}
                  </p>
                )}
              </header>

              {description ? (
                <section className="flex flex-col gap-4">
                  <h3 className="text-[24px] font-semibold leading-[1.16] text-[#262626]">
                    {jobsT("description")}
                  </h3>
                  <div className="flex flex-col gap-4">{renderSectionBody(description)}</div>
                </section>
              ) : null}

              {responsibilities ? (
                <section className="flex flex-col gap-4">
                  <h3 className="text-[24px] font-semibold leading-[1.5] text-[#262626]">
                    {jobsT("responsibilities")}
                  </h3>
                  <div className="flex flex-col gap-4">{renderSectionBody(responsibilities)}</div>
                </section>
              ) : null}

              {requirements ? (
                <section className="flex flex-col gap-4">
                  <h3 className="text-[24px] font-semibold leading-[1.16] text-[#262626]">
                    {jobsT("requirements")}
                  </h3>
                  <div className="flex flex-col gap-4">{renderSectionBody(requirements)}</div>
                </section>
              ) : null}

              <JobDetailShare label={jobsT("detail.shareWith")} className="pt-2" />
            </div>

            <JobDetailSidebar
              job={job}
              locale={locale}
              relatedJobs={[]}
              applyHref={`/dashboard/company/jobs/${jobId}/applications`}
              isCompanyView={true}
              labels={{
                monthly: jobsT("detail.monthly"),
                details: jobsT("detail.details"),
                industry: jobsT("detail.industry"),
                employmentType: jobsT("detail.employmentType"),
                vacancy: jobsT("detail.vacancy"),
                gender: jobsT("detail.gender"),
                age: jobsT("detail.age"),
                applicationDeadline: jobsT("detail.applicationDeadline"),
                applyForJob: t("review.viewApplications"),
                applications: t("review.applicationsLabel"),
                relatedJobs: jobsT("detail.relatedJobs"),
                postedAgo: jobsT("postedAgo"),
                companySubLabel: jobsT("companySubLabel"),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
