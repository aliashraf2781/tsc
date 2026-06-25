import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { ApiError } from "@/lib/api/client"
import { getAdminJobs, getAdminUsers, getAdminStats } from "@/lib/api/services/admin.service"
import { AdminDashboardOverview } from "@/features/admin/components/admin-dashboard-overview"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

const EMPTY_META = { current_page: 1, last_page: 1, per_page: 10, total: 0 } as const

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("admin")

  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "admin") {
    // Rely on the normalized session role provided by `getSession()`.
    // Layout already attempts to canonicalize the upstream profile.
    redirect(`/${locale}/dashboard`)
  }

  let token = session.accessToken
  let stats = {
    total_users: 0,
    total_companies: 0,
    total_jobs: 0,
    pending_jobs: 0,
    published_jobs: 0,
  }
  let pendingJobs: Awaited<ReturnType<typeof getAdminJobs>>["data"] = []

  async function fetchAll(tkn: string) {
    const [statsRes, pendingRes] = await Promise.all([
      getAdminStats(tkn, locale).catch(() => ({ total_users: 0, total_companies: 0, total_jobs: 0, pending_jobs: 0 })),
      getAdminJobs(tkn, "pending", 1, locale).catch(() => ({ data: [], meta: { ...EMPTY_META } })),
    ])

    const publishedFromRes = (statsRes as any).published_jobs
    stats = {
      total_users: statsRes.total_users ?? 0,
      total_companies: statsRes.total_companies ?? 0,
      total_jobs: statsRes.total_jobs ?? 0,
      pending_jobs: statsRes.pending_jobs ?? (pendingRes.meta?.total ?? 0),
      published_jobs: publishedFromRes ?? ((statsRes.total_jobs ?? 0) - (statsRes.pending_jobs ?? 0)),
    }
    pendingJobs = pendingRes.data
  }

  try {
    const token = session.accessToken as string | undefined
    if (!token) redirect(`/${locale}/sign-in`)
    await fetchAll(token)
  } catch (err) {
    console.error("[Admin Dashboard] Load error:", err)
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect(`/${locale}/sign-in`)
    }
    stats = {
      total_users: 0,
      total_companies: 0,
      total_jobs: 0,
      pending_jobs: 0,
      published_jobs: 0,
    }
    pendingJobs = []
  }

  const initialAuthTokens = (session as unknown as { __persistTokens?: { access_token?: string; refresh_token?: string } }).__persistTokens

  return (
    <AdminPageLayout
      title={t("title")}
      description={t("description")}
      needsClientPersist={Boolean((session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist)}
      initialAuthTokens={initialAuthTokens}
    >
      <AdminDashboardOverview stats={stats} pendingJobs={pendingJobs} locale={locale} />
    </AdminPageLayout>
  )
}
