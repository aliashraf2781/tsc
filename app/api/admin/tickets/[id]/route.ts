import { NextResponse } from "next/server"
import { getSession, getCanonicalRole } from "@/lib/auth-token"
import { getAdminTicket, getAdminTickets } from "@/lib/api/services/tickets.service"
import { normalizeRole } from "@/lib/auth-token"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    // Debug helper: return minimal session info when ?debug=1 is present
    try {
      const url = new URL(request.url)
      if (url.searchParams.get("debug") === "1" || url.searchParams.get("debug") === "true") {
        return NextResponse.json({
          debug: {
            isLoggedIn: Boolean(session?.isLoggedIn),
            hasAccessToken: Boolean(session?.accessToken),
            user: session?.user ? { id: session.user.id, name: session.user.name, role: session.user.role } : null,
          },
        })
      }
      // Development-only impersonation helper: ?as=admin|company|user
      if (process.env.NODE_ENV !== "production") {
        const asRole = url.searchParams.get("as") || url.searchParams.get("impersonate")
        if (asRole) {
          const r = String(asRole).toLowerCase()
          if (!session.user) session.user = { id: 0, name: "(dev)", email: "(dev)@local", role: r as "user" | "company" | "admin" }
          else session.user.role = r as any
        }
      }
    } catch (e) {
      // ignore URL parsing errors and continue
    }

    // If not logged in, allow development impersonation mock path
    if (!session || !session.isLoggedIn) {
      if (process.env.NODE_ENV !== "production" && session?.user && normalizeRole(session.user) === "admin") {
        const { id } = await params
        const mock = {
          id: Number(id),
          subject: `Mock ticket #${id}`,
          status: "open",
          created_at: new Date().toISOString(),
          replies: [],
        }
        return NextResponse.json({ data: mock })
      }
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    // Ensure canonical role is admin before fetching ticket
    try {
      const canonicalRole = await getCanonicalRole(session)
      if (canonicalRole !== "admin") return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    } catch {
      if (normalizeRole(session.user) !== "admin") return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    // Fetch ticket using session access token only. Fail-fast on missing token.
    if (!session.accessToken) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    try {
      const ticket = await getAdminTicket(Number(id), session.accessToken as string, locale)
      return NextResponse.json({ data: ticket })
    } catch (err: any) {
      // If upstream doesn't expose a detail endpoint, fall back to fetching
      // the tickets list and locate the requested id. This handles backends
      // that only implement a list endpoint which already includes replies.
      if (err && err.status === 404) {
        try {
          const list = await getAdminTickets(session.accessToken as string, 1, locale)
          const found = (list.data || []).find((t: any) => Number(t.id) === Number(id))
          if (found) return NextResponse.json({ data: found })
        } catch {}
        return NextResponse.json({ message: "Not found" }, { status: 404 })
      }
      throw err
    }
  } catch (error) {
    console.error("[Admin Ticket Detail GET] Exception:", error)
    if (error && (error as any).status === 401) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }
    if (error && (error as any).status === 404) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }
    const message = error instanceof Error ? error.message : "Failed to load ticket"
    return NextResponse.json({ message }, { status: 500 })
  }
}
