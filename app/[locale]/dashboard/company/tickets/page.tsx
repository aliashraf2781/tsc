import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { getTickets } from "@/lib/api/services/tickets.service"
import type { PaginationMeta } from "@/lib/api/types"
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
      return { data: [], meta: undefined as PaginationMeta | undefined }
    }
  )

  return (
    <CompanyTicketsClient
      locale={locale}
      initialTickets={ticketsResult.data || []}
      initialMeta={ticketsResult.meta ?? null}
    />
  )
}
