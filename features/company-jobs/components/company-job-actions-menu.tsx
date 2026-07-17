"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  deleteCompanyJobAction,
  stopCompanyJobAction,
  activateCompanyJobAction,
} from "@/features/company-jobs/actions/job-actions"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"

export function CompanyJobActionsMenu({
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
    <>
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
        confirmLabel={t("menu.delete")}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
        pending={pending}
        pendingLabel={isAr ? "جاري الحذف..." : "Deleting..."}
        tone="danger"
        error={error}
        onConfirm={runDelete}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={pending}
            className="inline-flex size-8 items-center justify-center rounded-md text-[#525252] transition hover:bg-[#E8F2FF] disabled:opacity-50"
            aria-label={t("columns.actions")}
          >
            <MoreVertical className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[154px]">
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/company/jobs/${jobId}/applications`)}
          >
            {t("menu.applications")}
          </DropdownMenuItem>
          {status === "approved" || status === "active" ? (
            <DropdownMenuItem
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
            >
              {t("menu.stop")}
            </DropdownMenuItem>
          ) : status === "stopped" || status === "closed" ? (
            <DropdownMenuItem
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
            >
              {t("menu.activate")}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setError(null)
              setConfirmDelete(true)
            }}
          >
            {t("menu.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
