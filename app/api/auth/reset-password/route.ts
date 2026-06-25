import { NextRequest, NextResponse } from "next/server"
import { resetPassword } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const payload = {
      token: String((body.token as string) || ""),
      password: String((body.password as string) || ""),
      password_confirmation: String((body.password_confirmation as string) || (body.passwordConfirmation as string) || ""),
    }
    if (!payload.token || !payload.password || !payload.password_confirmation) {
      return NextResponse.json({ message: "missing fields" }, { status: 400 })
    }

    await resetPassword(payload as any, locale)
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
      const message = error instanceof ApiError ? error.message : "حدث خطأ"
    return NextResponse.json({ message }, { status })
  }
}
