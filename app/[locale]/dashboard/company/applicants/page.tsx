import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAllCompanyApplications } from "@/lib/api/services/company.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { mapApplicationStatus } from "@/features/company-jobs/lib/application-utils"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { cn } from "@/lib/utils"

export default async function CompanyApplicantsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  const isAr = locale === "ar"
  const isDe = locale === "de"
  const token = session.accessToken as string | undefined
  if (!token) redirect(`/${locale}/sign-in`)
  const applications = await getAllCompanyApplications(token, locale)

  const statusLabels: Record<string, string> = {
    pending: isAr ? "قيد الانتظار" : isDe ? "Ausstehend" : "Pending",
    approved: isAr ? "مقبول" : isDe ? "Akzeptiert" : "Approved",
    rejected: isAr ? "مرفوض" : isDe ? "Abgelehnt" : "Rejected",
  }

  return (
    <DashboardPageShell
      title={isAr ? "المتقدمون" : isDe ? "Bewerber" : "Applicants"}
      description={isAr ? "جميع طلبات التقيق على وظائف الشركة" : isDe ? "Alle eingegangenen Bewerbungen für Ihre Stellen" : "All applications submitted to your jobs"}
      isRTL={isAr}
    >
      <div className="overflow-hidden rounded-[8px] bg-white p-4 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-6">
        <div className="overflow-x-auto rounded-[8px]">
          <div
            className={cn(
              "flex min-w-[900px] items-center rounded-t-[8px] px-2 py-2 text-base font-normal text-white",
              isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
              "from-[#032C44] to-[#41A0CA]"
            )}
          >
            <div className="w-[25%] shrink-0 px-2">{isAr ? "المتقدم" : isDe ? "Bewerber" : "Candidate"}</div>
            <div className="w-[25%] shrink-0 px-2">{isAr ? "الوظيفة" : isDe ? "Stelle" : "Job"}</div>
            <div className="flex w-[15%] justify-center px-2">{isAr ? "الحالة" : isDe ? "Status" : "Status"}</div>
            <div className="flex flex-1 justify-end px-2">{isAr ? "الإجراءات" : isDe ? "Aktionen" : "Actions"}</div>
          </div>

          <div className="min-w-[900px] rounded-b-[8px] border border-t-0 border-[#E8F2FF]">
            {applications.length === 0 ? (
              <p className="bg-white px-4 py-12 text-center text-sm text-[#525252]">
                {isAr ? "لا توجد طلبات حتى الآن" : isDe ? "Noch keine Bewerbungen" : "No applications yet"}
              </p>
            ) : (
              applications.map((application, index) => {
                const status = mapApplicationStatus(application.status)
                return (
                  <div
                    key={`${application.jobId}-${application.id}`}
                    className={cn(
                      "flex items-center border-b border-[#F0F4F8] last:border-0",
                      index % 2 === 0 ? "bg-white" : "bg-gradient-to-l from-[#032C44]/10 to-[#41A0CA]/10"
                    )}
                  >
                    <div className="w-[25%] shrink-0 px-4 py-4 text-base font-medium text-[#262626]">
                      {application.user?.name || (isAr ? "متقدم" : isDe ? "Bewerber" : "Applicant")}
                    </div>
                    <div className="w-[25%] shrink-0 px-4 py-4 text-sm text-[#525252]">
                      {application.job ? getJobTitle(application.job, locale) : "—"}
                    </div>
                    <div className="flex w-[15%] justify-center px-2 py-4">
                      <DashboardStatusBadge status={status} label={statusLabels[status]} locale={locale} />
                    </div>
                    <div className="flex flex-1 justify-end px-4 py-3">
                      <Link
                        href={`/dashboard/company/jobs/${application.jobId}/applications/${application.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-[#78A3BE] bg-white px-4 text-sm font-medium text-[#006EA8] hover:bg-[#F5F9FC]"
                      >
                        {isAr ? "التفاصيل" : isDe ? "Details" : "Details"}
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </DashboardPageShell>
  )
}
