import { NextRequest, NextResponse } from "next/server"
import { getCountries } from "@/lib/api/services/auth.service"
import { getSession } from "@/lib/auth-token"

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "ar"
  const session = await getSession().catch(() => null)

  try {
    const list = await getCountries(locale ?? undefined, session?.accessToken ?? undefined)
    
    // Browser cache: 10 min, CDN: 24h, Stale: 7d
    // This balances fresh data with performance
    const response = NextResponse.json({ data: list })
    response.headers.set("Cache-Control", "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800")
    return response
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch countries" }, { status: 500 })
  }
}

