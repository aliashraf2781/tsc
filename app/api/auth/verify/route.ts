import { NextRequest, NextResponse } from "next/server"
import { verifyEmail } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    let email = ""
    let code = ""

    // Try JSON first
    // Prefer FormData (clients send FormData) then fallback to JSON
    try {
      const form = await request.formData()
      email = String(form.get("email") || "")
      code = String(form.get("code") || "")
    } catch {
      try {
        const body = await request.json()
        email = String((body as any).email || "")
        code = String((body as any).code || "")
      } catch {}
    }

    // As a last resort, try query param
    try {
      if (!email) email = String(request.nextUrl.searchParams.get("email") || "")
    } catch {}
    if (!email || !code) return NextResponse.json({ message: "missing fields" }, { status: 400 })

    await verifyEmail(email, code, locale)
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "فشل التحقق"
    return NextResponse.json({ message }, { status })
  }
}

