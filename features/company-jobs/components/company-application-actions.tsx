"use client"

import { useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Check, X } from "lucide-react"
import { updateApplicationStatusAction } from "@/features/company-jobs/actions/application-actions"
import { mapApplicationStatus } from "@/features/company-jobs/lib/application-utils"
import { cn } from "@/lib/utils"

type CompanyApplicationActionsProps = {
  applicationId: number
  jobId: number
  locale: string
  status: string
}

export function CompanyApplicationActions({
  applicationId,
  jobId,
  locale,
  status,
}: CompanyApplicationActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const isAr = locale === "ar"

  const runStatus = (next: "accepted" | "rejected") => {
    const successMsg = next === "accepted"
      ? (isAr ? "تم قبول الطلب بنجاح" : "Application approved successfully")
      : (isAr ? "تم رفض الطلب بنجاح" : "Application rejected successfully")

    const processingMsg = isAr ? "جاري المعالجة..." : "Processing..."
    const toastId = toast.loading(processingMsg)

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
          await new Promise(resolve => setTimeout(resolve, 800))
          router.push(`/dashboard/company/jobs/${jobId}/applications`)
          router.refresh()
        } else {
          toast.error(result.message || (isAr ? "فشل تحديث الحالة" : "Failed to update status"))
        }
      } catch {
        toast.dismiss(toastId)
        toast.error(isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred")
      }
    })
  }

  const normalizedStatus = mapApplicationStatus(status)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending || normalizedStatus === "approved"}
        onClick={() => runStatus("accepted")}
        className={cn(
          "inline-flex h-[42px] items-center gap-2 rounded-[10px] border border-[#B66FED] bg-[#E7D7FA] hover:bg-[#DBC3F7] px-6 text-sm font-bold text-[#9333CD] transition cursor-pointer disabled:opacity-50"
        )}
      >
        <Check className="size-4 font-bold" aria-hidden />
        {isAr ? "قبول الطلب" : "Approve"}
      </button>
      <button
        type="button"
        disabled={pending || normalizedStatus === "rejected"}
        onClick={() => runStatus("rejected")}
        className={cn(
          "inline-flex h-[42px] items-center gap-2 rounded-[10px] border border-[#F78E8E] bg-[#FDEDED] hover:bg-[#FCDADA] px-6 text-sm font-bold text-[#F53334] transition cursor-pointer disabled:opacity-50"
        )}
      >
        <X className="size-4 font-bold" aria-hidden />
        {isAr ? "رفض الطلب" : "Reject"}
      </button>
    </div>
  )
}
