import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth-token"
import { getTicket, deleteTicket } from "@/lib/api/services/tickets.service"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      try {
        const url = new URL(request.url)
        if (process.env.NODE_ENV !== "production") {
          const asRole = url.searchParams.get("as") || url.searchParams.get("impersonate")
          if (asRole && String(asRole).toLowerCase() === "user") {
            const { id: idStr } = await context.params
            const id = Number(idStr)
            const mock = { id, subject: `User mock ticket #${id}`, status: "open", created_at: new Date().toISOString(), replies: [] }
            return NextResponse.json({ data: mock })
          }
        }
      } catch {}

      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id: idStr } = await context.params
    const id = Number(idStr)
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"

    const ticket = await getTicket(id, token, locale)
    return NextResponse.json({ data: ticket })
  } catch (error) {
    console.error("[Ticket GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load ticket"
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id: idStr } = await context.params
    const id = Number(idStr)
    const locale = request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"

    await deleteTicket(id, token, locale)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Ticket DELETE] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to delete ticket"
    return NextResponse.json({ message }, { status: 500 })
  }
}
