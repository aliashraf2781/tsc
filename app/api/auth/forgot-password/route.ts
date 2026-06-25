import { NextRequest, NextResponse } from "next/server"
import { forgotPassword } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {}
    const cloned = request.clone()
    try {
      body = await cloned.json()
    } catch {
      try {
        const form = await request.formData()
        form.forEach((v, k) => { body[k] = typeof v === "string" ? v : v })
      } catch {}
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const email = String((body.email as string) || "")
    if (!email) return NextResponse.json({ message: "email missing" }, { status: 400 })

    await forgotPassword(email, locale)
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "حدث خطأ"
    return NextResponse.json({ message }, { status })
  }
}
