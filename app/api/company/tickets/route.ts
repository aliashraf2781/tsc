import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { getTickets, createTicket } from "@/lib/api/services/tickets.service"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || "1")
    const locale = searchParams.get("locale") || request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"

    const data = await getTickets(token, page, locale)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Company Tickets GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load tickets"
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"
    
    // We expect multipart/form-data
    const formData = await request.formData()
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string
    const priority = formData.get("priority") as "low" | "medium" | "high" | undefined
    const file = formData.get("file") as File | null

    if (!subject || !message) {
      return NextResponse.json({ message: "Subject and Message are required" }, { status: 400 })
    }

    const newTicket = await createTicket({
      subject,
      message,
      priority,
      receiver_id: "1",
      file
    }, token, locale)

    return NextResponse.json({ data: newTicket })
  } catch (error) {
    console.error("[Company Tickets POST] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to create ticket"
    return NextResponse.json({ message }, { status: 500 })
  }
}

