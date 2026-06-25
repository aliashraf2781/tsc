import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, getSession, normalizeRole } from "@/lib/auth-token"
import { getAdminTickets } from "@/lib/api/services/tickets.service"

export async function GET(request: NextRequest) {
  try {
    // Prefer token from cookie (works in Route Handler context)
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Validate admin role via session
    const session = await getSession()
    if (session.user && normalizeRole(session.user) !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || "1")
    const locale =
      searchParams.get("locale") ||
      request.headers.get("accept-language")?.split(",")[0] ||
      "ar"

    const data = await getAdminTickets(token, page, locale)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin Tickets GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load tickets"
    return NextResponse.json({ message }, { status: 500 })
  }
}

