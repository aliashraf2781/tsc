"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth-token"
import { updateApplicationStatus } from "@/lib/api/services/company.service"

export type ApplicationActionResult = { ok: true } | { ok: false; message: string }

export async function updateApplicationStatusAction(
  applicationId: number,
  jobId: number,
  status: "accepted" | "rejected",
  locale: string
): Promise<ApplicationActionResult> {
  const session = await getSession()
  if (!session.accessToken) {
    return { ok: false, message: "unauthorized" }
  }

  try {
    await updateApplicationStatus(applicationId, status, session.accessToken, locale)
    revalidatePath(`/${locale}/dashboard/company/jobs/${jobId}/applications`)
    revalidatePath(`/${locale}/dashboard/company/jobs/${jobId}/applications/${applicationId}`)
    revalidatePath(`/${locale}/dashboard/company/jobs`)
    revalidatePath(`/${locale}/dashboard/company`)
    revalidatePath(`/${locale}/dashboard/company/applicants`)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to update application",
    }
  }
}

