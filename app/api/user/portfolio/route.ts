import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { getUserPortfolio, savePortfolio, convertToUserPortfolio } from "@/lib/api/services/portfolio.service"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"

    // Use the server-side service to return a normalized UserPortfolio shape
    const portfolio = await getUserPortfolio(token, locale)

    // if (process.env.NODE_ENV !== "production") {
    //   try { console.debug("[Portfolio GET] normalized portfolio returned", { hasCv: !!portfolio.cv_url, eduCount: (portfolio.educations||[]).length, skillsCount: (portfolio.skills||[]).length }) } catch {}
    // }

    return NextResponse.json({ data: portfolio })
  } catch (error) {
    console.error("[Portfolio GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load portfolio"
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken
    
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || 
                   request.headers.get("x-locale") || 
                   session.locale || 
                   "ar"
    
    const formData = await request.formData()

    const response = await fetch(`${API_BASE}/portfolio`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": locale,
      },
    })

    const data = await response.json()
    // Normalize upstream response shape: some upstreams return { data: {...} }
    // while others return the object directly. Coerce to a consistent
    // portfolio shape before returning to the client.
    const apiData = (data && (data as any).data) ?? data ?? {}
    const normalized = convertToUserPortfolio(apiData)
    // if (process.env.NODE_ENV !== "production") {
    //   try { console.debug("[Portfolio POST] upstream status", response.status) } catch {}
    //   try { console.debug("[Portfolio POST] upstream body sample", JSON.stringify(data).slice(0, 1000)) } catch {}
    // }

    if (!response.ok) {
      console.error("[Portfolio POST] Error:", response.status, data)
      return NextResponse.json(
        { message: data.message || "Failed to save portfolio", errors: data.errors },
        { status: response.status }
      )
    }

    return NextResponse.json({ data: normalized }, { status: response.status })
  } catch (error) {
    console.error("[Portfolio POST] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to save portfolio"
    return NextResponse.json({ message }, { status: 500 })
  }
}
