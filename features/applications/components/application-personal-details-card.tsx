import { Card } from "@/components/ui/card"
import type { User } from "@/lib/api/types"
import { formatShortDate } from "../lib/format"
import type { ApplicationDetailLabels } from "../lib/labels"
import type { AppLocale } from "../lib/types"

function getGenderLabel(gender: string | null | undefined, labels: ApplicationDetailLabels): string {
  const normalized = String(gender || "").toLowerCase()
  if (normalized.includes("female")) return labels.female
  if (normalized.includes("male")) return labels.male
  return gender || "—"
}

export function ApplicationPersonalDetailsCard({
  userProfile,
  locale,
  labels,
}: {
  userProfile: User
  locale: AppLocale
  labels: ApplicationDetailLabels
}) {
  const fields: { label: string; value: string }[] = [
    { label: labels.name, value: userProfile.name },
    { label: labels.email, value: userProfile.email },
    { label: labels.phone, value: userProfile.phone || "—" },
    { label: labels.gender, value: getGenderLabel(userProfile.Userprofile?.gender, labels) },
    { label: labels.dateOfBirth, value: formatShortDate(userProfile.Userprofile?.dateOfBirth ?? undefined, locale) },
  ]

  return (
    <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
      <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
        {labels.personalDetails}
      </h2>
      <div className="space-y-3">
        {fields.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-0.5 rounded-[10px] border border-[#E8F2FF] bg-[#F9FBFD] px-4 py-3"
          >
            <span className="text-[11px] text-[#6B7280]">{item.label}</span>
            <span className="text-sm font-semibold text-[#032C44] break-all">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
