import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { getTicket } from "@/lib/api/services/tickets.service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      // Development-only impersonation: allow returning a mocked ticket when ?as=company
      try {
        const url = new URL(request.url)
        if (process.env.NODE_ENV !== "production") {
          const asRole = url.searchParams.get("as") || url.searchParams.get("impersonate")
          if (asRole && String(asRole).toLowerCase() === "company") {
            const { id } = await params
            const mock = {
              id: Number(id),
              subject: `Company mock ticket #${id}`,
              status: "open",
              created_at: new Date().toISOString(),
              replies: [],
            }
            return NextResponse.json({ data: mock })
          }
        }
      } catch {}

      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const locale =
      request.headers.get("accept-language")?.split(",")[0] ||
      session.locale ||
      "ar"

    const ticket = await getTicket(Number(id), token, locale)
    return NextResponse.json({ data: ticket })
  } catch (error) {
    console.error("[Company Ticket Detail GET] Exception:", error)
    if (error && (error as any).status === 401) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    const message = error instanceof Error ? error.message : "Failed to load ticket"
    return NextResponse.json({ message }, { status: 500 })
  }
}
