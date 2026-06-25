"use client"

import { useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Check, FileText, X } from "lucide-react"
import { mapApplicationStatus } from "@/features/company-jobs/lib/application-utils"
import { toast } from "sonner"
import { updateApplicationStatusAction } from "@/features/company-jobs/actions/application-actions"
import { cn } from "@/lib/utils"

export function ApplicationRowActions({
  applicationId,
  jobId,
  locale,
  status,
}: {
  applicationId: number
  jobId: number
  locale: string
  status: string
}) {
  const t = useTranslations("CompanyJobs")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const displayStatus = mapApplicationStatus(status)

  const runStatus = (next: "accepted" | "rejected") => {
    const successMsg = next === "accepted" 
      ? t("applicationsPage.approvedSuccess")
      : t("applicationsPage.rejectedSuccess")
    
    const toastId = toast.loading(t("applicationsPage.processing"))
    
    startTransition(async () => {
      try {
        const result = await updateApplicationStatusAction(
          applicationId,
          jobId,
          next,
          locale
        )
        
        toast.dismiss(toastId)
        
        if (result.ok) {
          toast.success(successMsg)
          router.refresh()
        } else {
          toast.error(result.message || t("applicationsPage.errorGeneral"))
        }
      } catch {
        toast.dismiss(toastId)
        toast.error(t("applicationsPage.errorGeneral"))
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        disabled={pending || displayStatus === "approved"}
        onClick={() => runStatus("accepted")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#B66FED] bg-[#E7D7FA] px-3 text-sm font-medium text-[#9333CD] transition hover:opacity-90 disabled:opacity-50"
        )}
      >
        <Check className="size-4" aria-hidden />
        {t("applicationsPage.approve")}
      </button>
      <button
        type="button"
        disabled={pending || displayStatus === "rejected"}
        onClick={() => runStatus("rejected")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#F78E8E] bg-[#FDEDED] px-3 text-sm font-medium text-[#F53334] transition hover:opacity-90 disabled:opacity-50"
      >
        <X className="size-4" aria-hidden />
        {t("applicationsPage.reject")}
      </button>
      <Link
        href={`/dashboard/company/jobs/${jobId}/applications/${applicationId}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#78A3BE] bg-white px-3 text-sm font-medium text-[#006EA8] transition hover:bg-[#F5F9FC]"
      >
        <FileText className="size-4" aria-hidden />
        {t("applicationsPage.details")}
      </Link>
    </div>
  )
}
