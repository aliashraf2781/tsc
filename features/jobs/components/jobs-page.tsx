import { Suspense } from "react"
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server"
import { SectionShell } from "@/features/shared-home"
import { getCategoriesForForm } from "@/lib/api/services/categories.service"
import { getJobsForLocale } from "@/features/jobs/lib/jobs-for-locale"
import { JobsPageClient } from "@/features/jobs/components/jobs-page-client"
import { GERMAN_STATES } from "@/features/company-jobs/lib/constants"

export async function JobsPage({ locale: propLocale }: { locale?: string } = {}) {
  const locale = propLocale ?? (await getLocale())
  // Ensure next-intl uses the route locale for translations
  setRequestLocale(locale)
  // Debug: ensure server-side locale is detected correctly
  const t = await getTranslations("Landing.jobsPage")
  const jobsT = await getTranslations("Landing.jobs")

  const [{ jobs, total }, categories] = await Promise.all([
    getJobsForLocale(locale, jobsT, { per_page: 48 }),
    getCategoriesForForm(locale),
  ])

  const categoryOptions =
    categories.length > 0
      ? categories.map((c) => c.name)
      : [
          t("filterPanel.categoryOptions.marketing"),
          t("filterPanel.categoryOptions.design"),
          t("filterPanel.categoryOptions.it"),
          t("filterPanel.categoryOptions.medical"),
        ]

  return (
    <main className="flex-1 bg-white">
      <SectionShell stagger={false} className="relative py-0">
        <Suspense>
          <JobsPageClient
            locale={locale}
            jobs={jobs}
            total={total}
            categories={categories}
            hero={{
              eyebrow: jobsT("eyebrow"),
              title: jobsT("title"),
              description: jobsT("description"),
              searchPlaceholder: t("searchPlaceholder"),
              search: t("search"),
            }}
            listingLabels={{
              allJobs: t("allJobs"),
              filter: t("filter"),
              department: t("department"),
              postedAgo: t("postedAgo"),
              salaryPeriod: t("salaryPeriod"),
              employmentFullTime: t("employmentFullTime"),
              companyName: t("companyName"),
              companySubLabel: t("companySubLabel"),
              moreDetails: jobsT("moreDetails"),
              filterPanelTitle: t("filterPanel.title"),
              clearAll: t("filterPanel.clearAll"),
              state: t("filterPanel.state"),
              categories: t("filterPanel.categories"),
              salary: t("filterPanel.salary"),
              salaryMin: t("filterPanel.salaryMin"),
              salaryMax: t("filterPanel.salaryMax"),
              from: t("filterPanel.from"),
              to: t("filterPanel.to"),
              noResults: t("noResults"),
              closeFilters: t("closeFilters"),
            }}
            stateOptions={[...GERMAN_STATES]}
            categoryOptions={categoryOptions}
          />
        </Suspense>
      </SectionShell>
    </main>
  )
}
