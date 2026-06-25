import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { replyToTicket } from "@/lib/api/services/tickets.service"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const locale =
      request.headers.get("accept-language")?.split(",")[0] ||
      session.locale ||
      "ar"

    const body = await request.json()
    const message = body.message

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 })
    }

    const ticket = await replyToTicket(Number(id), message.trim(), token, locale)
    return NextResponse.json({ data: ticket })
  } catch (error) {
    console.error("[Company Ticket Reply POST] Exception:", error)
    const msg = error instanceof Error ? error.message : "Failed to send reply"
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
