import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { getTickets } from "@/lib/api/services/tickets.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import CompanyTicketsClient from "./client"

export default async function CompanyTicketsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken || session.user?.role !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  // Load tickets from backend API
  const ticketsResult = await getTickets(session.accessToken, 1, locale).catch(
    (err) => {
      console.error("Failed to load company tickets in page.tsx", err)
      return { data: [] }
    }
  )
  const tickets = ticketsResult.data || []

  const isAr = locale === "ar"

  return <CompanyTicketsClient locale={locale} initialTickets={tickets} />
}
