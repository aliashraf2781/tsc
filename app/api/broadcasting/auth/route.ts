import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, getSession } from "@/lib/auth-token"
import { BACKEND_ORIGIN } from "@/lib/api/config"

export async function POST(request: NextRequest) {
  try {
    let token = getTokenFromRequest(request)
    if (!token) {
      const session = await getSession()
      token = session.accessToken
    }

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const socketId = body.socket_id
    const channelName = body.channel_name

    if (!socketId || !channelName) {
      return NextResponse.json({ message: "socket_id and channel_name are required" }, { status: 400 })
    }

    const backendRes = await fetch(`${BACKEND_ORIGIN}/broadcasting/auth`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ socket_id: socketId, channel_name: channelName }),
    })

    const data = await backendRes.text()
    return new NextResponse(data, {
      status: backendRes.status,
      headers: { "Content-Type": backendRes.headers.get("Content-Type") || "application/json" },
    })
  } catch (error) {
    console.error("[Broadcasting Auth] Exception:", error)
    return NextResponse.json({ message: "Channel authorization failed" }, { status: 500 })
  }
}
