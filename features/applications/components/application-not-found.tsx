import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import type { AppLocale } from "../lib/types"
import { getApplicationDetailLabels } from "../lib/labels"

export function ApplicationNotFound({ locale }: { locale: AppLocale }) {
  const isAr = locale === "ar"
  const labels = getApplicationDetailLabels(locale)

  const gradientClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  return (
    <div className="flex w-full flex-col gap-6 text-start">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <div className="min-w-0 flex-1">
          <h1 className={cn("text-[24px] leading-relaxed py-1", gradientClasses)}>{labels.title}</h1>
        </div>
      </div>
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
        <img src="/portfolio/drop.svg" alt="" className="w-16 h-16 mx-auto opacity-40 mb-4" />
        <p className="text-gray-500 font-medium">{labels.notFound}</p>
        <Link
          href="/dashboard/user/applications"
          className="inline-block mt-4 text-xs font-bold text-[#006EA8] hover:underline"
        >
          {labels.backToApplications}
        </Link>
      </div>
    </div>
  )
}
