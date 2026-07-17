"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { activateCompanyJobAction } from "@/features/company-jobs/actions/job-actions"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"

export default function ActivateJobButton({
  jobId,
  locale,
}: {
  jobId: number
  locale: string
}) {
  const t = useTranslations("CompanyJobs")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const isAr = locale === "ar"

  const confirmMsg =
    (t && typeof t === "function" ? t("confirmActivate") : undefined) || "Activate this job?"
  const activateLabel =
    (t && typeof t === "function" ? t("menu.activate") : undefined) || "Activate"

  async function runActivate() {
    if (pending) return
    setError(null)
    setPending(true)
    try {
      const result = await activateCompanyJobAction(jobId, locale)
      if (!result.ok) {
        setError(result.message ?? (isAr ? "فشل التفعيل" : "Failed to activate"))
        return
      }
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || (isAr ? "فشل التفعيل" : "Failed to activate"))
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <ConfirmActionDialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !pending) {
            setOpen(false)
            setError(null)
          }
        }}
        title={isAr ? "تأكيد التفعيل" : "Confirm activation"}
        description={confirmMsg}
        confirmLabel={activateLabel}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
        pending={pending}
        pendingLabel={isAr ? "جاري التفعيل..." : "Activating..."}
        tone="warning"
        error={error}
        onConfirm={runActivate}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-[#E8F2FF] px-3 py-1.5 text-xs font-semibold text-[#006EA8] hover:bg-[#D1EFFF] disabled:opacity-50"
      >
        {activateLabel}
      </button>
    </>
  )
}
