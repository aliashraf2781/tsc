import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getCompanyJob, getJobApplications } from "@/lib/api/services/company.service"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { ApplicationRowActions } from "@/features/company-jobs/components/application-row-actions"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { mapApplicationStatus, getApplicantDisplayName } from "@/features/company-jobs/lib/application-utils"
import { cn } from "@/lib/utils"

type CompanyJobApplicationsPageProps = {
  jobId: number
  locale: string
  accessToken: string
}

export async function CompanyJobApplicationsPage({
  jobId,
  locale,
  accessToken,
}: CompanyJobApplicationsPageProps) {
  const isRtl = locale === "ar"
  const t = await getTranslations("CompanyJobs")

  const [job, appsResult] = await Promise.all([
    getCompanyJob(jobId, accessToken, locale),
    getJobApplications(jobId, accessToken, 1, locale),
  ])
  if (!job) notFound()

  const applications = appsResult.data
  const jobTitle = getJobTitle(job, locale)

  const statusLabels: Record<string, string> = {
    pending: t("applicationsPage.status.pending"),
    approved: t("applicationsPage.status.accepted"),
    accepted: t("applicationsPage.status.accepted"),
    rejected: t("applicationsPage.status.rejected"),
  }

  return (
    <div className="flex w-full flex-col gap-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/company/jobs"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#006EA8] hover:underline"
        >
          <span aria-hidden>{isRtl ? "→" : "←"}</span>
          {t("applicationsPage.backToJobs")}
        </Link>
        <Link
          href={`/dashboard/company/jobs/${jobId}`}
          className="inline-flex h-9 items-center rounded-lg border border-[#78A3BE] bg-white px-4 text-sm font-medium text-[#006EA8] hover:bg-[#F5F9FC]"
        >
          {t("menu.review")}
        </Link>
      </div>

      <div className="rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={cn(
              "bg-clip-text text-[24px] font-bold leading-[1.16] text-transparent",
              isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l",
              "from-[#032C44] to-[#41A0CA]"
            )}>
              {t("applicationsPage.title")}
            </h1>
            <p className="mt-2 text-[16px] text-[#525252]">{jobTitle}</p>
          </div>
        </div>

        <div className="table-scrollbar overflow-x-auto rounded-[8px]">
          <div className={cn(
            "flex min-w-[720px] items-center rounded-t-[8px] px-2 py-2 text-base font-normal text-white",
            isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l",
            "from-[#032C44] to-[#41A0CA]"
          )}>
            <div className="w-[35%] shrink-0 px-2">{t("applicationsPage.candidate")}</div>
            <div className="flex w-[20%] justify-center px-2">{t("applicationsPage.statusLabel")}</div>
            <div className="flex flex-1 justify-end px-2">{t("applicationsPage.actionsLabel")}</div>
          </div>

          <div className="min-w-[720px] rounded-b-[8px] border border-t-0 border-[#E8F2FF]">
            {applications.length === 0 ? (
              <p className="bg-white px-4 py-12 text-center text-sm text-[#525252]">
                {t("applicationsPage.empty")}
              </p>
            ) : (
              applications.map((application, index) => {
                const appStatus = mapApplicationStatus(application.status)
                return (
                  <div
                    key={application.id}
                    className={cn(
                      "flex items-center border-b border-[#F0F4F8] last:border-0",
                      index % 2 === 0 ? "bg-white" : "bg-gradient-to-l from-[#032C44]/10 to-[#41A0CA]/10"
                    )}
                  >
                    <div className="w-[35%] shrink-0 px-4 py-4 text-base font-medium text-[#262626]">
                      {getApplicantDisplayName(application, {
                        mask: true,
                        unknownLabel: t("applicationsPage.unknownCandidate"),
                      })}
                    </div>
                    <div className="flex w-[20%] justify-center px-2 py-4">
                      <DashboardStatusBadge
                        status={appStatus}
                        label={statusLabels[appStatus]}
                      />
                    </div>
                    <div className="flex flex-1 justify-end px-4 py-3">
                      <ApplicationRowActions
                        applicationId={application.id}
                        jobId={jobId}
                        locale={locale}
                        status={application.status}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
