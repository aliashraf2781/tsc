import { useTranslations } from "next-intl"
import { Loader2Icon } from "lucide-react"

type Props = {
  message?: string
  /** Tailwind class for min-height, e.g. 'min-h-[400px]' */
  minHeightClass?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function DashboardLoading({ message, minHeightClass = "min-h-[360px]", size = "lg", className = "" }: Props) {
  const t = useTranslations("Ui.common")

  return (
    <div className={`flex justify-center items-center ${minHeightClass} w-full py-8`}>
      <div className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
        <div className="relative flex items-center justify-center">
          {/* Subtle outer pulse effect */}
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-[#006EA8]/10 duration-1000" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-[#E5E7EB]">
            <Loader2Icon className="h-6 w-6 animate-spin text-[#006EA8]" aria-hidden />
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-[15px] font-semibold text-[#032C44]">
            {message ?? (() => {
              try { return t("loading") } catch { return "Loading..." }
            })()}
          </p>
          <p className="text-[13px] text-gray-400">
            {(() => {
              try { return t("pleaseWait") } catch { return "Please wait..." }
            })()}
          </p>
        </div>
      </div>
    </div>
  )
}
