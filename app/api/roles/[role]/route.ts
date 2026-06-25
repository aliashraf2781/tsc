import { NextRequest, NextResponse } from "next/server"
import { api, ApiError } from "@/lib/api/client"

export async function GET(request: NextRequest, context: { params: Promise<{ role: string }> }) {
  try {
    const { role } = await context.params
    const path = `/roles/${encodeURIComponent(role)}`
    const data = await api.get<any>(path, { locale: request.headers.get("accept-language") || undefined })
    return NextResponse.json(data || {}, { status: 200 })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "فشل جلب الدور"
    return NextResponse.json({ message }, { status })
  }
}
