import { Card } from "@/components/ui/card"
import type { Experience } from "@/lib/api/types"
import { DocumentAttachmentLink } from "./document-attachment-link"
import type { ApplicationDetailLabels } from "../lib/labels"

export function ApplicationExperienceCard({
  experiences,
  labels,
}: {
  experiences: Experience[] | undefined
  labels: ApplicationDetailLabels
}) {
  return (
    <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
      <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
        {labels.experience}
      </h2>
      {experiences && experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div key={exp.id || idx} className="border-b border-[#E5E7EB] last:border-0 pb-4 last:pb-0">
              <h3 className="text-[15px] font-bold text-[#032C44]">{exp.job_title}</h3>
              <p className="text-xs text-[#006EA8] font-bold mt-1">{exp.company}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                {exp.start_date} - {exp.is_current ? labels.present : exp.end_date || ""}
              </p>
              <DocumentAttachmentLink url={exp.document_url} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm font-medium">{labels.noExperience}</div>
      )}
    </Card>
  )
}
