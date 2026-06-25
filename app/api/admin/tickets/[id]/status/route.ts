import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { updateTicketStatus } from "@/lib/api/services/tickets.service"
import { normalizeRole } from "@/lib/auth-token"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const token = session.accessToken

    // Development impersonation: allow status updates without a real token
    if (!token) {
      if (process.env.NODE_ENV !== "production" && session?.user && normalizeRole(session.user) === "admin") {
        const { id } = await params
        const form = await request.formData()
        const status = String(form.get("status") || "").trim()
        if (!status) return NextResponse.json({ message: "Missing status" }, { status: 400 })
        const mock = { id: Number(id), subject: `Mock ticket #${id}`, status, created_at: new Date().toISOString(), replies: [] }
        return NextResponse.json({ data: mock })
      }

      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    if (session.user && normalizeRole(session.user) !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    const { id } = await params
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    // parse form data (client posts FormData)
    const form = await request.formData()
    const status = String(form.get("status") || "").trim()
    if (!status) return NextResponse.json({ message: "Missing status" }, { status: 400 })

    const ticket = await updateTicketStatus(Number(id), status, token, locale)
    return NextResponse.json({ data: ticket })
  } catch (error) {
    console.error("[Admin Ticket Status POST] Exception:", error)
    if (error && (error as any).status === 401) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    const message = error instanceof Error ? error.message : "Failed to update status"
    return NextResponse.json({ message }, { status: 500 })
  }
}
