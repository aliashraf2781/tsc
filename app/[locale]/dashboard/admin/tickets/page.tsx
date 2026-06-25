import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { AdminTicketsPanel } from "@/features/admin/components/admin-tickets-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { getAdminTickets } from "@/lib/api/services/tickets.service"

export const dynamic = "force-dynamic"

export default async function AdminTicketsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  // session.user may be undefined when auth falls back to access_token cookie only;
  // in that case, normalizeRole returns 'user' (wrong). Only redirect non-admins
  // when we have confirmed user data pointing to a non-admin role.
  if (session.user && normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const needsClientPersist = Boolean(
    (session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist
  )
  const initialAuthTokens = (
    session as unknown as {
      __persistTokens?: { access_token?: string; refresh_token?: string }
    }
  ).__persistTokens

  // Fetch tickets server-side via the service (uses session.accessToken)
  let ticketsData: any[] = []
  try {
    const result = await getAdminTickets(session.accessToken!, 1, locale)
    ticketsData = result.data || []
  } catch (err) {
    console.error("[AdminTicketsPage] getAdminTickets error:", err)
    // Show empty list rather than crashing — client can refresh
    ticketsData = []
  }

  const isAr = locale === "ar"
  const isDe = locale === "de"

  return (
    <AdminPageLayout
      title={isAr ? "التذاكر" : isDe ? "Tickets" : "Tickets"}
      description={
        isAr
          ? "عرض تذاكر الدعم الفني وإدارتها"
          : isDe
            ? "Support-Tickets anzeigen und verwalten"
            : "View and manage support tickets"
      }
      needsClientPersist={needsClientPersist}
      initialAuthTokens={initialAuthTokens}
    >
      <AdminTicketsPanel tickets={ticketsData} locale={locale} />
    </AdminPageLayout>
  )
}
