import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { getMyApplications } from "@/lib/api/services/user.service"

export async function GET(request: NextRequest, { params }: { params?: Promise<{ id: string }> | { id: string } }) {
  const session = await getSession()
  const token = session?.accessToken as string | undefined

  if (!token) {
    return NextResponse.json({ hasOpen: false, message: "Unauthenticated" }, { status: 401 })
  }

  const locale = request.headers.get("x-locale") || request.headers.get("accept-language") || session?.locale || "ar"
  const p = params
  const { id } = (p && typeof (p as Promise<any>).then === "function") ? await (p as Promise<{ id: string }>) : (p as { id: string })
  const jobId = Number(id)

  const appsResult = await getMyApplications(token, 1, locale as "ar" | "en" | "de").catch(() => ({ data: [] }))
  const existing = (appsResult.data || []).find((a: any) => {
    const jid = a.job?.id || a.job?.job_id || a.job?.jobId || a.job
    return Number(jid) === jobId && (a.status === "pending" || a.status === "open")
  })

  if (existing) return NextResponse.json({ hasOpen: true, applicationId: existing.id }, { status: 200 })
  return NextResponse.json({ hasOpen: false }, { status: 200 })
}
