import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, getSession, normalizeRole } from "@/lib/auth-token"
import { getAdminTickets, createTicket } from "@/lib/api/services/tickets.service"
import { ApiError } from "@/lib/api/client"

export async function GET(request: NextRequest) {
  try {
    // Prefer token from cookie (works in Route Handler context)
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Validate admin role via session
    const session = await getSession()
    if (session.user && normalizeRole(session.user) !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || "1")
    const perPage = Number(searchParams.get("per_page") || "15")
    const locale =
      searchParams.get("locale") ||
      request.headers.get("accept-language")?.split(",")[0] ||
      "ar"

    const data = await getAdminTickets(token, page, locale, perPage)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin Tickets GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load tickets"
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const session = await getSession()
    if (session.user && normalizeRole(session.user) !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 })
    }

    const locale =
      request.headers.get("accept-language")?.split(",")[0] ||
      session.locale ||
      "ar"

    const contentType = request.headers.get("content-type") || ""
    let subject = ""
    let message = ""
    let priority: "low" | "medium" | "high" | undefined
    let receiverId: string | undefined
    let file: File | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      subject = String(formData.get("subject") || "").trim()
      message = String(formData.get("message") || "").trim()
      const pri = formData.get("priority")
      priority = pri ? (String(pri) as "low" | "medium" | "high") : undefined
      const rid = formData.get("receiver_id")
      receiverId = rid != null && String(rid).trim() !== "" ? String(rid) : undefined
      const rawFile = formData.get("file")
      file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null
    } else {
      const body = await request.json().catch(() => ({}))
      subject = String(body.subject || "").trim()
      message = String(body.message || "").trim()
      priority = body.priority
      receiverId =
        body.receiver_id != null && String(body.receiver_id).trim() !== ""
          ? String(body.receiver_id)
          : undefined
    }

    if (!subject || !message) {
      return NextResponse.json(
        { message: "Subject and message are required" },
        { status: 400 }
      )
    }

    if (!receiverId) {
      return NextResponse.json(
        { message: "receiver_id is required when creating an admin→user ticket" },
        { status: 400 }
      )
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return NextResponse.json(
        { message: "priority must be low, medium, or high" },
        { status: 400 }
      )
    }

    if (file && file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File must be 2MB or smaller" },
        { status: 400 }
      )
    }

    const newTicket = await createTicket(
      {
        subject,
        message,
        priority,
        receiver_id: receiverId,
        file,
      },
      token,
      locale
    )

    return NextResponse.json({ data: newTicket }, { status: 201 })
  } catch (error) {
    console.error("[Admin Tickets POST] Exception:", error)
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.errors },
        { status: error.status }
      )
    }
    const message = error instanceof Error ? error.message : "Failed to create ticket"
    return NextResponse.json({ message }, { status: 500 })
  }
}
