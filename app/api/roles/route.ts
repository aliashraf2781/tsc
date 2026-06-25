import { NextRequest, NextResponse } from "next/server"
import { api, ApiError } from "@/lib/api/client"

export async function GET(request: NextRequest) {
  try {
    const data = await api.get<any>("/roles", { locale: request.headers.get("accept-language") || undefined })
    return NextResponse.json(data || {}, { status: 200 })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "فشل جلب الأدوار"
    return NextResponse.json({ message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Forward body to upstream /roles
    let body: any = {}
    try { body = await request.json() } catch {}
    const data = await api.post<any>("/roles", body, { locale: request.headers.get("accept-language") || undefined })
    return NextResponse.json(data || {}, { status: 201 })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "فشل إنشاء الدور"
    return NextResponse.json({ message }, { status })
  }
}
