import React from "react"
import { LucideIcon } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  unit?: string
  icon: LucideIcon
  iconColor?: string
  linkText?: string
  linkHref?: string
}

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = "text-[#40A0CA]",
  linkText,
  linkHref = "#",
}: StatCardProps) {
  const locale = useLocale()
  const isRTL = locale === "ar"

  return (
    <div className="bg-white rounded-[8px] p-4 border border-gray-100 flex flex-col gap-6 flex-1 min-w-[310px] hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6">
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        <h3 className="font-semibold text-[16px] text-gray-900">{title}</h3>
      </div>
      
      <div className="flex items-end gap-1">
        <span className="text-[36px] font-bold text-gray-900 leading-[54px]">{value}</span>
        {unit && <span className="text-[12px] text-gray-400 mb-1">{unit}</span>}
      </div>

      {linkText && linkHref && (
        <Link 
          href={linkHref}
          className="flex items-center gap-2.5 py-1.5 group"
        >
          <span className="text-[16px] font-medium bg-gradient-to-r from-[#006EA8] to-[#005685] bg-clip-text text-transparent">
            {linkText}
          </span>
          <ArrowRight className={cn(
            "w-5 h-5 text-[#40A0CA] group-hover:translate-x-1 transition-transform",
            isRTL && "rotate-180 group-hover:-translate-x-1 group-hover:translate-y-0"
          )} />
        </Link>
      )}
    </div>
  )
}