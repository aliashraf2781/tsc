import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession, getCanonicalRole } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminTicket, getTicket } from "@/lib/api/services/tickets.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminTicketInlineView } from "@/features/admin/components/admin-ticket-inline-view"
import { ApiError } from "@/lib/api/client"

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const session = await getSession()

  // If not logged in, force sign-in
  if (!session.isLoggedIn) {
    redirect(`/${locale}/sign-in`)
  }

  const needsClientPersist = Boolean((session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist)
  const initialAuthTokens = (session as unknown as { __persistTokens?: { access_token?: string; refresh_token?: string } }).__persistTokens

  let ticketData: any | null = null
  let token: string | undefined = session.accessToken as string | undefined
  if (!token) {
    redirect(`/${locale}/sign-in`)
  }

  // Determine canonical role (prefer upstream profile)
  let canonicalRole = session.user ? normalizeRole(session.user) : "user"
  try {
    canonicalRole = await getCanonicalRole(session)
  } catch (e) {
    // ignore and fall back to session role
  }

  if (canonicalRole !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  try {
    if (token) {
      // Prefer admin endpoint, fall back to user endpoint
      try {
        ticketData = await getAdminTicket(Number(id), token!, locale)
      } catch (adminErr) {
        console.warn("[AdminTicketDetailPage] getAdminTicket failed, trying getTicket fallback:", adminErr)
        ticketData = await getTicket(Number(id), token!, locale)
      }
    }
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.status === 404) {
        ticketData = null
      } else if (err.status === 401) {
        redirect(`/${locale}/sign-in`)
      } else {
        console.error("[AdminTicketDetailPage] getTicket error:", err)
        ticketData = null
      }
    } else {
      console.error("[AdminTicketDetailPage] getTicket error:", err)
      ticketData = null
    }
  }

  return (
    <AdminPageLayout title={locale === "ar" ? "تفاصيل التذكرة" : "Ticket Details"} needsClientPersist={needsClientPersist} initialAuthTokens={initialAuthTokens}>
      <AdminTicketInlineView initialTicket={ticketData} ticketId={Number(id)} locale={locale} />
    </AdminPageLayout>
  )
}
