import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { markAllAsRead } from "@/lib/api/services/notifications.service"

export async function POST() {
  try {
    const session = await getSession()
    const token = session.accessToken
    if (!token) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 })
    }

    await markAllAsRead(token)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل تحديث الإشعارات"
    return NextResponse.json({ message }, { status: 500 })
  }
}

