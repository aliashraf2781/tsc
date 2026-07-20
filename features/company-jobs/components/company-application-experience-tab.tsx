import { normalizePortfolioShape, type CompanyApplication } from "@/features/company-jobs/lib/application-utils"
import { formatApplicationDate, getAttachmentFilename } from "@/features/company-jobs/lib/company-application-format"
import { DocumentAttachmentLink } from "@/features/company-jobs/components/document-attachment-link"
import type { CompanyApplicationDetailLabels } from "@/features/company-jobs/lib/company-application-detail-labels"

export function CompanyApplicationExperienceTab({
  application,
  locale,
  labels,
}: {
  application: CompanyApplication
  locale: string
  labels: CompanyApplicationDetailLabels
}) {
  const isAr = locale === "ar"
  const portfolio = normalizePortfolioShape(application.userPortfolio || {})

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {portfolio.workExperience.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#6B7280]">{labels.noExperience}</p>
        ) : (
          portfolio.workExperience.map((exp, index) => (
            <div key={exp.id || index} className="rounded-[12px] border border-[#E8F2FF] bg-[#F9FBFD] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#032C44]">{exp.company_name || "—"}</h3>
                  <p className="mt-1 text-sm text-[#006EA8]">{exp.department || "—"}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#525252]">
                  {formatApplicationDate(exp.start_date, locale)} -{" "}
                  {exp.currently_working ? labels.currentlyWorking : formatApplicationDate(exp.end_date, locale)}
                </span>
              </div>
              {exp.responsibilities ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#525252]">
                  {exp.responsibilities}
                </p>
              ) : null}
              <DocumentAttachmentLink url={exp.attachment} />
            </div>
          ))
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#032C44]">{labels.skills}</h3>
        {portfolio.skills.length === 0 ? (
          <p className="text-sm text-[#6B7280]">{labels.noSkills}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {portfolio.skills.map((skill, index) => (
              <div key={skill.id || index} className="flex items-center gap-2">
                <span className="rounded-full border border-[#cfe7f7] bg-[#EBF5FB] px-3 py-1.5 text-xs font-bold text-[#006EA8]">
                  {skill.skill_name}
                </span>
                {skill.attachment ? (
                  <a
                    href={skill.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-[200px] items-center gap-1 truncate text-xs font-medium text-[#006EA8] hover:underline"
                    aria-label={isAr ? `فتح المرفق ${skill.skill_name}` : `Open attachment for ${skill.skill_name}`}
                  >
                    <img src="/portfolio/pdf.svg" alt="attachment" className="h-4 w-4 shrink-0" />
                    {getAttachmentFilename(skill.attachment)}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
