import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { replyToTicket } from "@/lib/api/services/tickets.service"
import { normalizeRole } from "@/lib/auth-token"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const token = session.accessToken

    // Allow development impersonation when no token is present
    if (!token) {
      if (!(process.env.NODE_ENV !== "production" && session?.user && normalizeRole(session.user) === "admin")) {
        return NextResponse.json({ message: "Not authorized" }, { status: 403 })
      }
    } else {
      if (normalizeRole(session.user) !== "admin") {
        return NextResponse.json({ message: "Not authorized" }, { status: 403 })
      }
    }

    const { id } = await params
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    let message = ""
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const body = await request.json()
      message = body.message
    } else {
      const formData = await request.formData()
      message = formData.get("message") as string
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 })
    }

    // If running in development and no token, return mocked reply result
    if (!token && process.env.NODE_ENV !== "production") {
      const { id } = await params
      const mock = { id: Number(id), subject: `Mock ticket #${id}`, status: "answered", created_at: new Date().toISOString(), replies: [{ id: 1, message: message.trim(), created_at: new Date().toISOString(), by: "admin" }] }
      return NextResponse.json({ data: mock })
    }

    const ticket = await replyToTicket(Number(id), message.trim(), token!, locale)
    return NextResponse.json({ data: ticket })
  } catch (error) {
    console.error("[Admin Ticket Reply POST] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to send reply"
    return NextResponse.json({ message }, { status: 500 })
  }
}
