import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { replyToTicket } from "@/lib/api/services/tickets.service"

export async function POST(
  request: Request,
  context: { params: Promise<any> }
) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = await context.params
    const locale =
      request.headers.get("accept-language")?.split(",")[0] ||
      session.locale ||
      "ar"

    const contentType = request.headers.get("content-type") || ""
    let message = ""
    let file: File | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      message = (formData.get("message") as string) || ""
      const f = formData.get("file")
      if (f instanceof File && f.size > 0) file = f
    } else {
      const body = await request.json()
      message = body.message
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 })
    }

    const ticket = await replyToTicket(Number(id), message.trim(), token, locale, file)
    return NextResponse.json({ data: ticket })
  } catch (error) {
    console.error("[User Ticket Reply POST] Exception:", error)
    const msg = error instanceof Error ? error.message : "Failed to send reply"
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
