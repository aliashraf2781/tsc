import { normalizePortfolioShape, type CompanyApplication } from "@/features/company-jobs/lib/application-utils"
import { formatApplicationDate, calcApplicantAge } from "@/features/company-jobs/lib/company-application-format"
import { getGenderLabel, getMaritalStatusLabel, getLanguageLevelLabel } from "@/features/company-jobs/lib/company-application-enums"
import type { CompanyApplicationDetailLabels } from "@/features/company-jobs/lib/company-application-detail-labels"

export function CompanyApplicationOverviewTab({
  application,
  locale,
  labels,
}: {
  application: CompanyApplication
  locale: string
  labels: CompanyApplicationDetailLabels
}) {
  const isAr = locale === "ar"
  const profile = application.user?.Userprofile
  const age = calcApplicantAge(profile?.dateOfBirth)
  const portfolio = normalizePortfolioShape(application.userPortfolio || {})

  const languageList = portfolio.languages
    .map((lang: Record<string, unknown>) => {
      const name = String(lang.language || "").trim()
      if (!name) return ""
      const translatedLevel = getLanguageLevelLabel(String(lang.level || "").trim(), locale)
      return translatedLevel ? `${name} (${translatedLevel})` : name
    })
    .filter(Boolean)
    .join(isAr ? "، " : ", ")

  const items = [
    { label: labels.dateOfBirth, value: formatApplicationDate(profile?.dateOfBirth, locale) },
    { label: labels.age, value: age != null ? `${age} ${labels.years}` : "—" },
    { label: labels.gender, value: getGenderLabel(profile?.gender, labels) },
    { label: labels.maritalStatus, value: getMaritalStatusLabel(profile?.maritalStatus, labels) },
    {
      label: labels.category,
      value:
        [application.job?.category?.name, application.job?.sub_category?.name].filter(Boolean).join(" — ") ||
        profile?.categoryName ||
        profile?.subcategoryName ||
        "—",
    },
    { label: labels.languages, value: languageList || "—" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[12px] border border-[#E8F2FF] bg-[#F9FBFD] px-4 py-3">
          <p className="text-xs text-[#6B7280]">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-[#032C44]">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
