import { Card } from "@/components/ui/card"
import type { Education } from "@/lib/api/types"
import { getEducationLevelLabel, getGraduationYear, getGradeDisplay } from "../lib/education"
import { DocumentAttachmentLink } from "./document-attachment-link"
import type { ApplicationDetailLabels } from "../lib/labels"
import type { AppLocale } from "../lib/types"

export function ApplicationEducationCard({
  educations,
  locale,
  labels,
}: {
  educations: Education[] | undefined
  locale: AppLocale
  labels: ApplicationDetailLabels
}) {
  return (
    <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
      <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
        {labels.education}
      </h2>
      {educations && educations.length > 0 ? (
        <div className="space-y-4">
          {educations.map((edu, idx) => {
            const gradeDisplay = getGradeDisplay(edu, locale)
            return (
              <div key={edu.id || idx} className="border-b border-[#E5E7EB] last:border-0 pb-4 last:pb-0">
                <h3 className="text-[15px] font-bold text-[#032C44]">
                  {getEducationLevelLabel(edu.degree, locale)}
                </h3>
                <p className="text-xs text-[#006EA8] font-bold mt-1">
                  {edu.institution} • {edu.field_of_study}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium mt-2">
                  <span>
                    {labels.year}: <span className="text-[#032C44] font-bold">{getGraduationYear(edu)}</span>
                  </span>
                  {gradeDisplay && (
                    <span>
                      {labels.grade}: <span className="text-[#032C44] font-bold">{gradeDisplay}</span>
                    </span>
                  )}
                </div>
                <DocumentAttachmentLink url={edu.document_url} />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm font-medium">{labels.noEducation}</div>
      )}
    </Card>
  )
}
