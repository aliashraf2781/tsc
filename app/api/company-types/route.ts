import { NextRequest, NextResponse } from "next/server"
import { api } from "@/lib/api/client"
import { getSession } from "@/lib/auth-token"
import { API_BASE_URL } from "@/lib/api/config"

const BASE_URL = API_BASE_URL

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "ar"
  const session = await getSession().catch(() => null)

  try {
    // Preserve original query params (per_page, page, etc.) when proxying
    const query = request.nextUrl.search || ""
    const endpoint = `/company-types${query}`

    // Call upstream and return the raw response so callers receive
    // { data: [...], meta: {...}, links: {...} } when available.
    const upstream = await api.get<unknown>(endpoint, { locale, token: session?.accessToken ?? undefined })

    const response = NextResponse.json(upstream)
    response.headers.set("Cache-Control", "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800")
    return response
  } catch (err) {
    return NextResponse.json({ data: [], error: "Failed to fetch company types" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession().catch(() => null)
  const token = session?.accessToken

  try {
    const contentType = request.headers.get("content-type") || undefined
    const body = await request.arrayBuffer()
    const res = await fetch(`${BASE_URL}/company-types`, {
      method: "POST",
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(request.headers.get("accept-language") ? { "Accept-Language": request.headers.get("accept-language")! } : {}),
        ...(request.headers.get("cookie") ? { Cookie: request.headers.get("cookie")! } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? Buffer.from(body) : undefined,
    })

    const text = await res.text().catch(() => "")
    let parsed: unknown = null
    try { parsed = text ? JSON.parse(text) : null } catch { parsed = text }

    return NextResponse.json(parsed ?? null, { status: res.status })
  } catch (err) {
    return NextResponse.json({ data: null, error: "Failed to create company type" }, { status: 500 })
  }
}

