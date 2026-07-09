"use client"

import { cn } from "@/lib/utils"
import { gradientTitleClasses } from "../lib/style-constants"

export function PortfolioSectionCard({
  locale,
  title,
  action,
  children,
}: {
  locale: string
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const isAr = locale === "ar"

  return (
    <div className="rounded-[16px] bg-white p-6 border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className={cn("text-[20px] font-bold", gradientTitleClasses(isAr))}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}
