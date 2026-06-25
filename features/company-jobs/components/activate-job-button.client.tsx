"use client"

import { useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { activateCompanyJobAction } from "@/features/company-jobs/actions/job-actions"

export default function ActivateJobButton({
  jobId,
  locale,
}: {
  jobId: number
  locale: string
}) {
  const t = useTranslations("CompanyJobs")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const runActivate = () => {
    const confirmMsg = (t && typeof t === "function" ? t("confirmActivate") : undefined) || "Activate this job?"
    if (!confirm(confirmMsg)) return
    startTransition(async () => {
      try {
        const result = await activateCompanyJobAction(jobId, locale)
        if (result.ok) router.refresh()
        else alert(result.message)
      } catch (err: any) {
        alert(err?.message || "Failed to activate")
      }
    })
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={runActivate}
      className="inline-flex items-center gap-2 rounded-lg bg-[#E8F2FF] px-3 py-1.5 text-xs font-semibold text-[#006EA8] hover:bg-[#D1EFFF] disabled:opacity-50"
    >
      {(t && typeof t === "function" ? t("menu.activate") : undefined) || "Activate"}
    </button>
  )
}
