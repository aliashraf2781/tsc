import { Card } from "@/components/ui/card"
import type { Skill } from "@/lib/api/types"
import type { ApplicationDetailLabels } from "../lib/labels"

export function ApplicationSkillsCard({
  skills,
  labels,
}: {
  skills: Skill[] | undefined
  labels: ApplicationDetailLabels
}) {
  return (
    <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
      <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">{labels.skills}</h2>
      {skills && skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <span
              key={skill.id || idx}
              className="bg-[#F4FAFF] text-[#006EA8] border border-[#E5F2FF] px-3 py-1.5 rounded-full text-xs font-bold"
            >
              {skill.name}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-2 text-gray-400 text-sm font-medium">{labels.noSkills}</div>
      )}
    </Card>
  )
}
