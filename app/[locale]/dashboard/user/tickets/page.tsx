import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { getTickets } from "@/lib/api/services/tickets.service"
import TicketsClient from "./client"

export default async function UserTicketsPage({
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

  // Load tickets from backend API
  const ticketsResult = await getTickets(session.accessToken, 1, locale).catch(
    (err) => {
      console.error("Failed to load tickets in page.tsx", err)
      return { data: [] }
    }
  )
  const tickets = ticketsResult.data || []

  return <TicketsClient locale={locale} initialTickets={tickets} />
}
