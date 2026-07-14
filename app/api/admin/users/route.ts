import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, getSession, normalizeRole } from "@/lib/auth-token"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { ApiError } from "@/lib/api/client"

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const session = await getSession()
    if (session.user && normalizeRole(session.user) !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || "1")
    const perPage = Number(searchParams.get("per_page") || "50")
    const role = searchParams.get("role") || "user"
    const locale =
      searchParams.get("locale") ||
      request.headers.get("accept-language")?.split(",")[0] ||
      "ar"

    const data = await getAdminUsers(token, role, page, locale, perPage)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin Users GET] Exception:", error)
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : "Failed to load users"
    return NextResponse.json({ message }, { status: 500 })
  }
}
