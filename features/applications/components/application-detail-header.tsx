import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import type { AppLocale } from "../lib/types"

export function ApplicationDetailHeader({
  locale,
  title,
  subtitle,
  backLabel,
}: {
  locale: AppLocale
  title: string
  subtitle: string
  backLabel: string
}) {
  const isAr = locale === "ar"
  const isDe = locale === "de"

  const gradientClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
      <div className="min-w-0 flex-1">
        <h1 className={cn("text-[24px] leading-relaxed py-1", gradientClasses)}>{title}</h1>
        <p className="mt-1 text-sm text-[#525252]">{subtitle}</p>
      </div>
      <Link
        href="/dashboard/user/applications"
        className="flex items-center gap-2 px-5 py-2.5 border border-[#006EA8] text-[#006EA8] hover:bg-[#F0F9FF] rounded-[8px] text-[14px] font-semibold transition"
      >
        <span aria-hidden>{isAr ? "→" : isDe ? "→" : "←"}</span>
        {backLabel}
      </Link>
    </div>
  )
}
