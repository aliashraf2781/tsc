import { redirect } from "next/navigation"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { enrichJobsWithApplicationCounts, getCompanyJobs, maybeStopExpiredJobs } from "@/lib/api/services/company.service"
import { getProfile } from "@/lib/api/services/auth.service"
import type { Job } from "@/lib/api/types"
import { CompanyJobActionsMenu } from "@/features/company-jobs/components/company-job-actions-menu"
import { mapCompanyJobBadgeStatus } from "@/features/company-jobs/lib/job-status"
import { formatApplicationDeadline, resolveJobApplicationDeadline } from "@/features/jobs/lib/job-display"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import {
  getProfileCompanyLogo,
  getProfileCompanyName,
  resolveCompanyLogoForDisplay,
} from "@/features/company-profile/lib/profile-logo"
import { CompanyAvatar } from "@/features/company-profile/components/company-avatar"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { ApiError } from "@/lib/api/client"
import { cn } from "@/lib/utils"

export default async function CompanyJobsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("CompanyJobs")
  const session = await getSession()
  const isRtl = locale === "ar"
  // Allow development impersonation via cookie `impersonate=company`
  let isImpersonatingCompany = false
  if (!session.isLoggedIn || !session.accessToken) {
    if (process.env.NODE_ENV !== "production") {
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const imp = cookieStore.get("impersonate")?.value
        if (imp && String(imp).toLowerCase() === "company") {
          isImpersonatingCompany = true
        } else {
          redirect(`/${locale}/sign-in`)
        }
      } catch {
        redirect(`/${locale}/sign-in`)
      }
    } else {
      redirect(`/${locale}/sign-in`)
    }
  }

  if (!isImpersonatingCompany && normalizeRole(session.user) !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  const statusLabels: Record<string, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    active: t("status.approved"),
    rejected: t("status.rejected"),
    stopped: t("status.stopped"),
    closed: t("status.stopped"),
  }

  let jobs: Awaited<ReturnType<typeof getCompanyJobs>>["data"] | null = null
  let profileLogo: string | undefined
  let profileCompanyName = ""

  try {
    const token = session.accessToken as string | undefined
    // If impersonating in dev, return mocked jobs without calling upstream
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const imp = cookieStore.get("impersonate")?.value
    if (imp && String(imp).toLowerCase() === "company") {
      jobs = [
        { id: 20, title: { ar: "تطوير الويب" }, status: "approved", applications_count: 12, created_at: new Date().toISOString(), application_deadline: "2027-12-31" },
        { id: 21, title: { ar: "تصميم واجهات" }, status: "approved", applications_count: 3, created_at: new Date().toISOString(), application_deadline: "2027-12-31" },
      ] as Job[]
    } else {
      if (!token) redirect(`/${locale}/sign-in`)
      const [jobsRes, profile] = await Promise.all([
        getCompanyJobs(token, 1, locale),
        getProfile(token, locale).catch(() => null),
      ])
      jobs = await enrichJobsWithApplicationCounts(jobsRes.data, token, locale)
      jobs = await maybeStopExpiredJobs(jobs, token, locale)
      profileLogo = profile ? getProfileCompanyLogo(profile) : undefined
      profileCompanyName = profile ? getProfileCompanyName(profile, locale) : ""
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    }
    jobs = null
  }

  if (jobs === null) {
    return (
      <div className="p-6">
        <p className="text-[#FF2D55]">{t("loadError")}</p>
      </div>
    )
  }

  return (
    <DashboardPageShell
      title={t("listTitle")}
      isRTL={isRtl}
      action={
        <Link
          locale={locale}
          href="/dashboard/company/jobs/create"
          className="inline-flex h-9 w-auto items-center justify-center rounded-lg border border-[#E8F2FF] bg-white px-4 text-sm font-semibold text-[#006EA8] shadow-none transition hover:bg-[#F5F9FC]"
        >
          {t("addJob")}
        </Link>
      }
    >
      <div className="overflow-hidden rounded-[8px] shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] ">
        {jobs.length === 0 ? (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <Image src="/dashboard/jobs.svg" alt="" width={96} height={96} className="opacity-40" />
            </div>
            <p className="text-[#525252] font-medium text-[15px]">{t("empty")}</p>
            <p className="text-gray-400 text-sm mt-1">{isRtl ? "أضف وظيفتك الأولى من الزر أعلاه" : "Add your first job using the button above"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[8px]">
            {/* Table header - تدرج معكوس في RTL */}
            <div
              className={cn(
                "flex min-w-[914px] items-center rounded-t-[8px] text-white",
                isRtl
                  ? "bg-gradient-to-r from-[#032C44] to-[#41A0CA]" // RTL: من اليسار إلى اليمين
                  : "bg-gradient-to-l from-[#032C44] to-[#41A0CA]" // LTR: من اليمين إلى اليسار
              )}
            >
              <div className={"w-[30%] shrink-0 px-2 py-2 text-base font-normal"}>
                {t("columns.title")}
              </div>
              <div className="flex w-[18%] justify-center px-2 py-2 text-base font-normal">
                {t("columns.applications")}
              </div>
              <div className="flex w-[18%] justify-center px-2 py-2 text-base font-normal">
                {t("columns.deadline")}
              </div>
              <div className="flex w-[18%] justify-center px-2 py-2 text-base font-normal">
                {t("columns.status")}
              </div>
              <div className={"flex flex-1 px-2 py-2 text-base font-normal justify-center "}>
                {t("columns.actions")}
              </div>
            </div>

            {/* Table body - تدرج معكوس في RTL للصفوف المخططة */}
            <div className="min-w-[914px] rounded-b-[8px] border border-t-0 border-[#E8F2FF]">
              {jobs.map((job, index) => {
                const badgeStatus = mapCompanyJobBadgeStatus(job.status)
                const rawDeadline = resolveJobApplicationDeadline(job)
                const deadline = formatApplicationDeadline(rawDeadline, locale)

                return (
                  <div
                    key={job.id}
                    className={cn(
                      "flex items-center border-b border-[#F0F4F8] last:border-0",
                      index % 2 === 0
                        ? "bg-white"
                        : isRtl
                          ? "bg-gradient-to-r from-[#032C44]/10 to-[#41A0CA]/10" // RTL: تدرج معكوس
                          : "bg-gradient-to-l from-[#032C44]/10 to-[#41A0CA]/10" // LTR: تدرج عادي
                    )}
                  >
                    <div
                      className={cn("flex w-[30%] shrink-0 items-center gap-2 px-2 py-3 text-base font-medium text-[#262626]")}
                    >
                      {(() => {
                        const logo = resolveCompanyLogoForDisplay(job.company, profileLogo)
                        const companyNameFromApi =
                          job.company?.name ??
                          (profileCompanyName ||
                            (job as Job & { company_name?: string; companyName?: string }).company_name ||
                            (job as Job & { company_name?: string; companyName?: string }).companyName ||
                            "")

                        return (
                          <CompanyAvatar
                            logo={logo}
                            name={companyNameFromApi}
                            size="sm"
                          />
                        )
                      })()}

                      <Link
                        locale={locale}
                        href={`/dashboard/company/jobs/${job.id}`}
                        className={cn("truncate hover:text-[#006EA8] hover:underline justify-start ")}
                      >
                        {getJobTitle(job, locale)}
                      </Link>
                    </div>
                    <div className="flex w-[18%] justify-center px-2 py-3 text-base text-[#262626]">
                      <Link
                        locale={locale}
                        href={`/dashboard/company/jobs/${job.id}/applications`}
                        className="font-semibold text-[#006EA8] hover:underline"
                      >
                        {job.applications_count ?? 0}
                      </Link>
                    </div>
                    <div className="flex w-[18%] justify-center px-2 py-3 text-base text-[#262626]">
                      {deadline}
                    </div>
                    <div className="flex w-[18%] justify-center px-2 py-3">
                      <DashboardStatusBadge
                        status={badgeStatus}
                        label={statusLabels[job.status] ?? statusLabels[badgeStatus]}
                        locale={locale}
                      />
                    </div>
                    <div className={"flex flex-1 px-2 py-3 justify-center gap-2 items-center "}>
                      <Link
                        locale={locale}
                        href={`/dashboard/company/jobs/${job.id}`}
                        className="inline-flex items-center gap-2 rounded-[8px] bg-gradient-to-b from-[#006EA8] to-[#005685] px-4 py-2 text-xs font-normal text-white shadow-[inset_0_1px_18px_2px_#E8F2FF,inset_0_1px_4px_2px_#C2DDFF] hover:opacity-95"
                      >
                        <Image src="/dashboard/jobs.svg" alt="" width={16} height={16} className="h-4 w-4 brightness-0 invert" />
                        {t("columns.details")}
                      </Link>
                      <CompanyJobActionsMenu
                        jobId={job.id}
                        locale={locale}
                        status={job.status}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardPageShell>
  )
}