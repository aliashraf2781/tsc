import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { getUnreadCount } from "@/lib/api/services/notifications.service"

export async function GET() {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ unread_count: 0 })
    }

    const data = await getUnreadCount(token)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ unread_count: 0 })
  }
}

