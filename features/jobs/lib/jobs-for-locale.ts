import type { Job } from "@/lib/api/types"
import { getJobKeys } from "@/features/jobs/services/jobs.service"
import {
  getPublicJobDetail,
  getPublicJobs,
  type JobsFilter,
} from "@/lib/api/services/jobs.service"

type JobsTranslator = (key: string) => string

export function shouldUseJobsSeedData(): boolean {
  // Only use seed data when explicitly opted-in via NEXT_PUBLIC_USE_JOBS_SEED_DATA.
  // This forces the app to use the live upstream API by default, including in dev.
  return process.env.NEXT_PUBLIC_USE_JOBS_SEED_DATA === "true"
}

function buildFallbackJobs(t: JobsTranslator): Job[] {
  const keys = getJobKeys()

  return keys.map((key, index) => ({
    id: index + 1,
    title: t(`items.${key}.title`),
    status: "approved" as const,
    created_at: new Date().toISOString(),
    created_at_human: "14 hours ago",
    state: "Berlin",
    salary_from: 1200,
    salary_to: 1800,
    vacancy: 1,
    gender: "All",
    employment_type: t(`items.${key}.type`),
    application_deadline: "2027-12-31",
    age_from: 18,
    age_to: 45,
    category: {
      id: index + 1,
      name: t(`items.${key}.department`),
      slug: key,
    },
    company: {
      id: 1,
      name: t(`items.${key}.company`),
      description: "",
      company_type: { id: 1, name: t(`items.${key}.department`) },
      country: { id: 1, name: "Germany", code: "DE" },
      city: { id: 1, name: "Berlin", country: { id: 1, name: "Germany", code: "DE" } },
    },
  }))
}

export async function getJobsForLocale(
  locale: string,
  t: JobsTranslator,
  filter: JobsFilter = { per_page: 12 }
): Promise<{ jobs: Job[]; total: number; fromApi: boolean }> {
  // If explicitly opted-in to seed data, prefer it immediately for local testing.
  if (process.env.NEXT_PUBLIC_USE_JOBS_SEED_DATA === "true") {
    const fallback = buildFallbackJobs(t)
    return { jobs: fallback, total: fallback.length, fromApi: false }
  }

  try {
    const { data, meta } = await getPublicJobs(filter, locale)
    if (data.length > 0) {
      return {
        jobs: data,
        total: meta?.total ?? data.length,
        fromApi: true,
      }
    }
  } catch (err) {
    console.error(err)
    // fall through to fallback when enabled
  }

  if (!shouldUseJobsSeedData()) {
    return { jobs: [], total: 0, fromApi: false }
  }

  const fallback = buildFallbackJobs(t)
  return { jobs: fallback, total: fallback.length, fromApi: false }
}

export async function getJobDetailForLocale(
  locale: string,
  jobId: number,
  t: JobsTranslator
): Promise<{ job: Job; related: Job[]; fromApi: boolean } | null> {
  try {
    const detail = await getPublicJobDetail(jobId, locale)
    if (detail?.job) {
      return { job: detail.job, related: detail.related, fromApi: true }
    }
  } catch (err) {
    console.error(err)
    // fall through
  }

  if (!shouldUseJobsSeedData()) return null

  const { jobs } = await getJobsForLocale(locale, t, { per_page: 48 })
  const job = jobs.find((item) => item.id === jobId)
  if (!job) return null

  return {
    job,
    related: jobs.filter((item) => item.id !== jobId).slice(0, 2),
    fromApi: false,
  }
}

/** @deprecated Use getJobDetailForLocale */
export async function getJobForLocale(
  locale: string,
  jobId: number,
  t: JobsTranslator
): Promise<Job | null> {
  const detail = await getJobDetailForLocale(locale, jobId, t)
  return detail?.job ?? null
}
