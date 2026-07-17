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
  approveJobAction,
  rejectJobAction,
  deleteAdminJobAction,
  stopAdminJobAction,
  activateAdminJobAction,
} from "@/features/admin/actions/admin-actions"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"

function mapStatusForBadge(status: string): "pending" | "approved" | "rejected" | "stopped" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  if (status === "stopped" || status === "closed") return "stopped"
  return "pending"
}

function isJobStopped(status: string): boolean {
  return status === "stopped" || status === "closed"
}

type ConfirmKind = "reject" | "delete" | "stop" | "activate"

export function AdminJobActionsMenu({
  jobId,
  locale,
  status,
}: {
  jobId: number
  locale: string
  status: string
}) {
  const t = useTranslations("Admin.jobs")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null)
  const isAr = locale === "ar"
  const badgeStatus = mapStatusForBadge(status)
  const stopped = isJobStopped(status)

  async function runConfirm() {
    if (!confirmKind || pending) return
    const kind = confirmKind
    setError(null)
    setPending(true)
    try {
      const result =
        kind === "reject"
          ? await rejectJobAction(jobId, locale)
          : kind === "delete"
            ? await deleteAdminJobAction(jobId, locale)
            : kind === "stop"
              ? await stopAdminJobAction(jobId, locale)
              : await activateAdminJobAction(jobId, locale)

      if (!result.ok) {
        setError(result.message ?? (isAr ? "فشلت العملية" : "Action failed"))
        return
      }
      setConfirmKind(null)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const confirmCopy: Record<
    ConfirmKind,
    { title: string; description: string; confirmLabel: string; tone: "danger" | "warning" }
  > = {
    reject: {
      title: isAr ? "تأكيد الرفض" : "Confirm reject",
      description: isAr ? "هل تريد رفض هذه الوظيفة؟" : "Reject this job?",
      confirmLabel: t("reject"),
      tone: "danger",
    },
    delete: {
      title: isAr ? "تأكيد الحذف" : "Confirm deletion",
      description: isAr ? "هل تريد حذف هذه الوظيفة؟" : "Delete this job?",
      confirmLabel: t("delete"),
      tone: "danger",
    },
    stop: {
      title: isAr ? "تأكيد الإيقاف" : "Confirm stop",
      description: isAr ? "هل تريد إيقاف هذه الوظيفة؟" : "Stop this job?",
      confirmLabel: t("stop"),
      tone: "warning",
    },
    activate: {
      title: isAr ? "تأكيد التفعيل" : "Confirm activation",
      description: isAr ? "هل تريد تفعيل هذه الوظيفة؟" : "Activate this job?",
      confirmLabel: t("activate"),
      tone: "warning",
    },
  }

  const activeCopy = confirmKind ? confirmCopy[confirmKind] : null

  return (
    <>
      <ConfirmActionDialog
        open={confirmKind !== null}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setConfirmKind(null)
            setError(null)
          }
        }}
        title={activeCopy?.title ?? ""}
        description={activeCopy?.description ?? ""}
        confirmLabel={activeCopy?.confirmLabel ?? (isAr ? "تأكيد" : "Confirm")}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
        pending={pending}
        pendingLabel={isAr ? "جاري..." : "Working..."}
        tone={activeCopy?.tone ?? "danger"}
        error={error}
        onConfirm={runConfirm}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={pending}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex size-8 items-center justify-center rounded-lg text-[#525252] transition hover:bg-[#E8F2FF] disabled:opacity-50"
            aria-label={t("more")}
            title={t("more")}
          >
            <MoreVertical className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[170px]">
          {(badgeStatus === "approved" || badgeStatus === "stopped") && (
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation()
                router.push(`/dashboard/admin/jobs/${jobId}/applications`)
              }}
            >
              {t("viewApplications")}
            </DropdownMenuItem>
          )}
          {badgeStatus === "pending" && (
            <>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  void (async () => {
                    setPending(true)
                    try {
                      const result = await approveJobAction(jobId, locale)
                      if (result.ok) router.refresh()
                      else setError(result.message ?? (isAr ? "فشل الاعتماد" : "Approve failed"))
                    } finally {
                      setPending(false)
                    }
                  })()
                }}
              >
                {t("approve")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  setError(null)
                  setConfirmKind("reject")
                }}
              >
                {t("reject")}
              </DropdownMenuItem>
            </>
          )}
          {(badgeStatus === "approved" || stopped) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  setError(null)
                  setConfirmKind(stopped ? "activate" : "stop")
                }}
              >
                {stopped ? t("activate") : t("stop")}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={(event) => {
              event.stopPropagation()
              setError(null)
              setConfirmKind("delete")
            }}
          >
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
