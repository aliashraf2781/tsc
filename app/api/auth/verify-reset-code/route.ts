import { NextRequest, NextResponse } from "next/server"
import { verifyResetCode } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const email = String((body.email as string) || "")
    const code = String((body.code as string) || "")
    if (!email || !code) return NextResponse.json({ message: "missing fields" }, { status: 400 })

    const data = await verifyResetCode(email, code, locale)
    return NextResponse.json(data || {}, { status: 200 })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "فشل التحقق"
    return NextResponse.json({ message }, { status })
  }
}
