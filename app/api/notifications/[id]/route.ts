import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { deleteNotification } from "@/lib/api/services/notifications.service"

export async function DELETE(_request: any, context: any) {
  try {
    const session = await getSession()
    const token = session?.accessToken
    if (!token) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 })
    }

    // context.params may be a Promise in some Next.js typings; handle both cases
    const params = context?.params && typeof (context.params as any).then === "function" ? await context.params : context?.params
    const id = params?.id
    if (!id) {
      return NextResponse.json({ message: "معرف غير صالح" }, { status: 400 })
    }

    await deleteNotification(Number(id), token)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل حذف الإشعار"
    return NextResponse.json({ message }, { status: 500 })
  }
}
