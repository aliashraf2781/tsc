import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { registerDeviceToken } from "@/lib/api/services/notifications.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken
    if (!token) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 })
    }

    const body = await request.json()
    const { device_token, device_type = "web" } = body

    if (!device_token) {
      return NextResponse.json({ message: "device_token مطلوب" }, { status: 400 })
    }

    await registerDeviceToken(device_token, device_type, token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/notifications/token] error:", error)
    if (error instanceof ApiError) {
      const msg = error.message || "فشل تسجيل رمز الجهاز"
      const status = typeof error.status === "number" && error.status > 0 ? error.status : 500
      return NextResponse.json({ message: msg }, { status })
    }

    const message = error instanceof Error ? error.message : "فشل تسجيل رمز الجهاز"
    return NextResponse.json({ message }, { status: 500 })
  }
}

