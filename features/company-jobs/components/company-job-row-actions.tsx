"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import {
  deleteCompanyJobAction,
  stopCompanyJobAction,
  activateCompanyJobAction,
} from "@/features/company-jobs/actions/job-actions"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"

export function CompanyJobRowActions({
  jobId,
  locale,
  status,
}: {
  jobId: number
  locale: string
  status: string
}) {
  const t = useTranslations("CompanyJobs")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isAr = locale === "ar"

  async function runDelete() {
    if (pending) return
    setError(null)
    setPending(true)
    try {
      const result = await deleteCompanyJobAction(jobId, locale)
      if (!result.ok) {
        setError(result.message ?? (isAr ? "فشل الحذف" : "Delete failed"))
        return
      }
      setConfirmDelete(false)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ConfirmActionDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setConfirmDelete(false)
            setError(null)
          }
        }}
        title={isAr ? "تأكيد الحذف" : "Confirm deletion"}
        description={t("confirmDelete")}
        confirmLabel={t("delete")}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
        pending={pending}
        pendingLabel={isAr ? "جاري الحذف..." : "Deleting..."}
        tone="danger"
        error={error}
        onConfirm={runDelete}
      />

      <button
        type="button"
        disabled={pending}
        onClick={() => router.push(`/dashboard/company/jobs/${jobId}/applications`)}
        className="text-sm text-[#006EA8] hover:underline disabled:opacity-50"
      >
        {t("applications")}
      </button>
      {status === "approved" || status === "active" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            void (async () => {
              setPending(true)
              try {
                const result = await stopCompanyJobAction(jobId, locale)
                if (result.ok) router.refresh()
                else setError(result.message ?? (isAr ? "فشل الإيقاف" : "Stop failed"))
              } finally {
                setPending(false)
              }
            })()
          }}
          className="text-sm text-amber-700 hover:underline disabled:opacity-50"
        >
          {t("stop")}
        </button>
      ) : status === "stopped" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            void (async () => {
              setPending(true)
              try {
                const result = await activateCompanyJobAction(jobId, locale)
                if (result.ok) router.refresh()
                else setError(result.message ?? (isAr ? "فشل التفعيل" : "Activate failed"))
              } finally {
                setPending(false)
              }
            })()
          }}
          className="text-sm text-[#006EA8] hover:underline disabled:opacity-50"
        >
          {t("menu.activate")}
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null)
          setConfirmDelete(true)
        }}
        className="text-sm text-[#FF2D55] hover:underline disabled:opacity-50"
      >
        {t("delete")}
      </button>
    </div>
  )
}
