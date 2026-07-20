import { Card } from "@/components/ui/card"
import type { Language } from "@/lib/api/types"
import type { ApplicationDetailLabels } from "../lib/labels"

export function ApplicationLanguagesCard({
  languages,
  labels,
}: {
  languages: Language[] | undefined
  labels: ApplicationDetailLabels
}) {
  return (
    <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
      <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
        {labels.languages}
      </h2>
      {languages && languages.length > 0 ? (
        <div className="space-y-2.5">
          {languages.map((lang, idx) => (
            <div
              key={lang.id || idx}
              className="flex items-center justify-between border border-[#E5E7EB] rounded-[12px] px-3.5 py-2.5 bg-[#F9FAFB]"
            >
              <span className="text-sm font-bold text-[#032C44]">{lang.name}</span>
              <span className="bg-[#EBF5FF] text-[#006EA8] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                {lang.proficiency}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-2 text-gray-400 text-sm font-medium">{labels.noLanguages}</div>
      )}
    </Card>
  )
}
