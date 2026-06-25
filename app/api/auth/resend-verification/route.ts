import { NextRequest, NextResponse } from "next/server"
import { resendVerification } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    let email = ""
    // Prefer FormData (client sends FormData), then JSON, then query param
    try {
      const form = await request.formData()
      email = String(form.get("email") || "")
    } catch {}

    if (!email) {
      try {
        const body = await request.json()
        email = String((body as any).email || "")
      } catch {}
    }

    try {
      if (!email) email = String(request.nextUrl.searchParams.get("email") || "")
    } catch {}

    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    if (!email) return NextResponse.json({ message: "email missing" }, { status: 400 })

    await resendVerification(email, locale)
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "فشل إعادة الإرسال"
    return NextResponse.json({ message }, { status })
  }
}
