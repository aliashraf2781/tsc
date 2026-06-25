import { getLocale, getTranslations, setRequestLocale } from "next-intl/server"
import { getCategoriesForForm } from "@/lib/api/services/categories.service"
import { getJobsForLocale } from "@/features/jobs/lib/jobs-for-locale"
import { JobsSectionClient } from "@/features/jobs/components/jobs-section-client"

type JobsSectionProps = {
  override?: {
    title?: string
    description?: string
  }
}

export async function JobsSection({ override }: JobsSectionProps) {
  const locale = await getLocale()
  setRequestLocale(locale)
  const t = await getTranslations("Landing.jobs")

  // No profile fetch here — each job card should show its own company logo

  const [{ jobs }, categories] = await Promise.all([
    getJobsForLocale(locale, t, { per_page: 12 }),
    getCategoriesForForm(locale),
  ])

  return <JobsSectionClient jobs={jobs} categories={categories} title={override?.title} description={override?.description} />
}
