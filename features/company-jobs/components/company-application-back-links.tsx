import { Link } from "@/i18n/navigation"
import type { CompanyApplicationDetailLabels } from "@/features/company-jobs/lib/company-application-detail-labels"

export function CompanyApplicationBackLinks({
  jobId,
  locale,
  labels,
}: {
  jobId: number
  locale: string
  labels: CompanyApplicationDetailLabels
}) {
  const isAr = locale === "ar"

  return (
    <div className="flex items-center gap-4">
      <Link
        href={`/dashboard/company/jobs/${jobId}/applications`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8] hover:underline"
      >
        <span aria-hidden>{isAr ? "→" : "←"}</span>
        {labels.back}
      </Link>
      <Link
        href="/dashboard/company/jobs"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8] hover:underline"
      >
        {labels.backToJobs}
      </Link>
    </div>
  )
}
