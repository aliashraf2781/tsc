"use client"

import { useTransition } from "react"
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

function mapStatusForBadge(status: string): "pending" | "approved" | "rejected" | "stopped" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  if (status === "stopped" || status === "closed") return "stopped"
  return "pending"
}

function isJobStopped(status: string): boolean {
  return status === "stopped" || status === "closed"
}

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
  const [pending, startTransition] = useTransition()
  const isAr = locale === "ar"
  const badgeStatus = mapStatusForBadge(status)
  const stopped = isJobStopped(status)

  const runReject = () => {
    if (!confirm(isAr ? "هل تريد رفض هذه الوظيفة؟" : "Reject this job?")) return
    startTransition(async () => {
      const result = await rejectJobAction(jobId, locale)
      if (result.ok) router.refresh()
      else alert(result.message)
    })
  }

  const runDelete = () => {
    if (!confirm(isAr ? "هل تريد حذف هذه الوظيفة؟" : "Delete this job?")) return
    startTransition(async () => {
      const result = await deleteAdminJobAction(jobId, locale)
      if (result.ok) router.refresh()
      else alert(result.message)
    })
  }

  const runStop = () => {
    if (!confirm(isAr ? "هل تريد إيقاف هذه الوظيفة؟" : "Stop this job?")) return
    startTransition(async () => {
      const result = await stopAdminJobAction(jobId, locale)
      if (result.ok) router.refresh()
      else alert(result.message)
    })
  }

  const runActivate = () => {
    if (!confirm(isAr ? "هل تريد تفعيل هذه الوظيفة؟" : "Activate this job?")) return
    startTransition(async () => {
      const result = await activateAdminJobAction(jobId, locale)
      if (result.ok) router.refresh()
      else alert(result.message)
    })
  }

  return (
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
                startTransition(async () => {
                  const result = await approveJobAction(jobId, locale)
                  if (result.ok) router.refresh()
                  else alert(result.message)
                })
              }}
            >
              {t("approve")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation()
                runReject()
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
                stopped ? runActivate() : runStop()
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
            runDelete()
          }}
        >
          {t("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
