import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { ApiError } from "@/lib/api/client"
import { updatePassword } from "@/lib/api/services/auth.service"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const { current_password, new_password, new_password_confirmation } = body as Record<string, string>
    if (!new_password || !new_password_confirmation) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 })
    }

    if (!session || !session.accessToken) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    await updatePassword(current_password || "", new_password, new_password_confirmation, session.accessToken as string, session.locale || "ar")
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "فشل تغيير كلمة المرور"
    return NextResponse.json({ message }, { status })
  }
}

