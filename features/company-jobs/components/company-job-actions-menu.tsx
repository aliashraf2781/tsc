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
  deleteCompanyJobAction,
  stopCompanyJobAction,
  activateCompanyJobAction,
} from "@/features/company-jobs/actions/job-actions"

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
  const [pending, startTransition] = useTransition()

  const runDelete = () => {
    if (!confirm(t("confirmDelete"))) return
    startTransition(async () => {
      const result = await deleteCompanyJobAction(jobId, locale)
      if (result.ok) router.refresh()
      else alert(result.message)
    })
  }

  const runStop = () => {
    startTransition(async () => {
      const result = await stopCompanyJobAction(jobId, locale)
      if (result.ok) router.refresh()
      else alert(result.message)
    })
  }

  const runActivate = () => {
    startTransition(async () => {
      const result = await activateCompanyJobAction(jobId, locale)
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
          <DropdownMenuItem onClick={runStop}>{t("menu.stop")}</DropdownMenuItem>
        ) : status === "stopped" || status === "closed" ? (
          <DropdownMenuItem onClick={runActivate}>{t("menu.activate")}</DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={runDelete}>
          {t("menu.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
