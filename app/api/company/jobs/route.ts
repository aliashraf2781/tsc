import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { createJob } from "@/lib/api/services/company.service"
import { ApiError } from "@/lib/api/client"
import { formatApiValidationMessage } from "@/features/company-jobs/lib/format-api-error"
import { getSession } from "@/lib/auth-token"

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.accessToken) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 })
  }

  const locale =
    request.headers.get("x-locale") ??
    request.headers.get("accept-language")?.split(",")[0]?.trim() ??
    "ar"

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid form data" }, { status: 400 })
  }

  try {
    await createJob(formData, session.accessToken, locale)
    revalidatePath(`/${locale}/dashboard/company/jobs`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = formatApiValidationMessage(err, "Failed to create job")
    let status = err instanceof ApiError ? err.status : 500
    if (status < 200 || status > 599) status = 500
    return NextResponse.json({ ok: false, message }, { status })
  }
}
