import { normalizePortfolioShape, type CompanyApplication } from "@/features/company-jobs/lib/application-utils"
import { getDegreeLabel, getGradeLabel } from "@/features/company-jobs/lib/company-application-enums"
import { DocumentAttachmentLink } from "@/features/company-jobs/components/document-attachment-link"
import type { CompanyApplicationDetailLabels } from "@/features/company-jobs/lib/company-application-detail-labels"

export function CompanyApplicationEducationTab({
  application,
  locale,
  labels,
}: {
  application: CompanyApplication
  locale: string
  labels: CompanyApplicationDetailLabels
}) {
  const portfolio = normalizePortfolioShape(application.userPortfolio || {})

  if (portfolio.education.length === 0) {
    return <p className="py-8 text-center text-sm text-[#6B7280]">{labels.noEducation}</p>
  }

  return (
    <div className="space-y-4">
      {portfolio.education.map((edu, index) => (
        <div key={edu.id || index} className="rounded-[12px] border border-[#E8F2FF] bg-[#F9FBFD] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#032C44]">{getDegreeLabel(edu.level_of_education, locale)}</h3>
              <p className="mt-1 text-sm text-[#006EA8]">{edu.university || "—"}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#525252]">
              {edu.graduation_year || "—"}
            </span>
          </div>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-xs text-[#6B7280]">{labels.specialization}</span>
              <p className="font-semibold text-[#262626]">{edu.specialization || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-[#6B7280]">{labels.grade}</span>
              <p className="font-semibold text-[#262626]">{getGradeLabel(edu.final_grade, locale)}</p>
            </div>
          </div>
          <DocumentAttachmentLink url={edu.attachment} />
        </div>
      ))}
    </div>
  )
}
