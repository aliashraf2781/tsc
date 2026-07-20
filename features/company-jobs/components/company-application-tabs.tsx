import { cn } from "@/lib/utils"
import type { CompanyApplicationDetailLabels } from "@/features/company-jobs/lib/company-application-detail-labels"

export type CompanyApplicationTabKey = "overview" | "education" | "experience"

export function CompanyApplicationTabs({
  activeTab,
  onChange,
  labels,
}: {
  activeTab: CompanyApplicationTabKey
  onChange: (tab: CompanyApplicationTabKey) => void
  labels: CompanyApplicationDetailLabels
}) {
  const tabs: Array<{ key: CompanyApplicationTabKey; label: string }> = [
    { key: "overview", label: labels.overview },
    { key: "education", label: labels.education },
    { key: "experience", label: labels.experience },
  ]

  return (
    <div className="mt-6 flex flex-wrap gap-6 border-b border-[#E5E7EB]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "pb-3 text-sm font-semibold transition",
            activeTab === tab.key
              ? "border-b-2 border-[#006EA8] text-[#006EA8]"
              : "text-[#6B7280] hover:text-[#006EA8]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
