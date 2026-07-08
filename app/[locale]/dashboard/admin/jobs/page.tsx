import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Plus } from "lucide-react"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminJobs } from "@/lib/api/services/admin.service"
import type { Job } from "@/lib/api/types"
import { Link } from "@/i18n/navigation"
import { AdminJobsPanel } from "@/features/admin/components/admin-jobs-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

const VALID_TABS = ["pending", "approved", "rejected", "all"] as const

type Tab = (typeof VALID_TABS)[number]

/** Postman admin statuses: pending, active, closed, rejected (+ legacy approved/stopped). */
const EXTRA_STATUS_FETCH = ["closed", "stopped"] as const

async function fetchJobsForStatus(
  token: string,
  status: string | undefined,
  locale: string
): Promise<Job[]> {
  const first = await getAdminJobs(token, status, 1, locale).catch(() => ({
    data: [] as Job[],
    meta: { total: 0, last_page: 1 },
  }))

  const jobs = [...first.data]
  const lastPage = Number(first.meta?.last_page ?? 1)

  if (lastPage > 1) {
    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) =>
        getAdminJobs(token, status, i + 2, locale).catch(() => ({ data: [] as Job[], meta: { last_page: 1 } }))
      )
    )
    const seen = new Set(jobs.map((j) => j.id))
    for (const page of rest) {
      for (const job of page.data) {
        if (!seen.has(job.id)) {
          seen.add(job.id)
          jobs.push(job)
        }
      }
    }
  }

  return jobs
}

function mergeUniqueJobs(batches: Job[][]): Job[] {
  const seen = new Set<number>()
  const merged: Job[] = []
  for (const batch of batches) {
    for (const job of batch) {
      if (!seen.has(job.id)) {
        seen.add(job.id)
        merged.push(job)
      }
    }
  }
  return merged
}

async function fetchAllAdminJobs(token: string, locale: string): Promise<Job[]> {
  const batches = await Promise.all([
    fetchJobsForStatus(token, undefined, locale),
    ...EXTRA_STATUS_FETCH.map((status) => fetchJobsForStatus(token, status, locale)),
  ])
  return mergeUniqueJobs(batches)
}

export default async function AdminJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { status: statusParam } = await searchParams
  const session = await getSession()
  const t = await getTranslations("Admin.jobs")

  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const needsClientPersist = Boolean((session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist)

  let jobs: Job[] = []
  let serverCounts: { total: number; pending: number; approved: number; rejected: number } | undefined

  try {
    const token = session.accessToken as string | undefined
    if (token) {
      const [allRes, pendingRes, approvedRes, activeRes, closedRes, stoppedRes, rejectedRes, allJobs] =
        await Promise.all([
          getAdminJobs(token, undefined, 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } })),
          getAdminJobs(token, "pending", 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } })),
          getAdminJobs(token, "approved", 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } })),
          getAdminJobs(token, "active", 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } })),
          getAdminJobs(token, "closed", 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } })),
          getAdminJobs(token, "stopped", 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } })),
          getAdminJobs(token, "rejected", 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } })),
          fetchAllAdminJobs(token, locale),
        ])

      jobs = allJobs

      serverCounts = {
        total: Number(allRes.meta?.total ?? jobs.length),
        pending: Number(pendingRes.meta?.total ?? 0),
        approved:
          Number(approvedRes.meta?.total ?? 0) +
          Number(activeRes.meta?.total ?? 0) +
          Number(closedRes.meta?.total ?? 0) +
          Number(stoppedRes.meta?.total ?? 0),
        rejected: Number(rejectedRes.meta?.total ?? 0),
      }
    }
  } catch (err) {
    console.error(err)
    jobs = []
  }

  const initialTab: Tab =
    statusParam && VALID_TABS.includes(statusParam as Tab) ? (statusParam as Tab) : "all"

  return (
    <AdminPageLayout
      title={t("title")}
      description={t("description")}
      needsClientPersist={needsClientPersist}
      action={
        <Link
          locale={locale}
          href="/dashboard/admin/jobs/create"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 sm:w-auto"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {t("addJob")}
        </Link>
      }
    >
      <AdminJobsPanel jobs={jobs} locale={locale} initialTab={initialTab} serverCounts={serverCounts} />
    </AdminPageLayout>
  )
}
