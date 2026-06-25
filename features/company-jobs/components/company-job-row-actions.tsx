"use client"

import { useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import {
  deleteCompanyJobAction,
  stopCompanyJobAction,
  activateCompanyJobAction,
} from "@/features/company-jobs/actions/job-actions"

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
    <div className="flex flex-wrap items-center gap-2">
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
          onClick={runStop}
          className="text-sm text-amber-700 hover:underline disabled:opacity-50"
        >
          {t("stop")}
        </button>
      ) : status === "stopped" ? (
        <button
          type="button"
          disabled={pending}
          onClick={runActivate}
          className="text-sm text-[#006EA8] hover:underline disabled:opacity-50"
        >
          {t("menu.activate")}
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={runDelete}
        className="text-sm text-[#FF2D55] hover:underline disabled:opacity-50"
      >
        {t("delete")}
      </button>
    </div>
  )
}
