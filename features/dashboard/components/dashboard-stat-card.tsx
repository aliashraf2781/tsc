"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

const ICON_GRADIENT_FILTER =
  "[filter:brightness(0)_saturate(100%)_invert(28%)_sepia(89%)_saturate(1200%)_hue-rotate(176deg)_brightness(92%)_contrast(101%)]"

const GRADIENT_TEXT = "linear-gradient(180deg, #006EA8 0%, #005685 100%)"

type DashboardStatCardProps = {
  iconSrc: string
  title: string
  value: number | string
  unit?: string
  viewAllHref?: string
  viewAllLabel?: string
  locale?: string
  isRTL?: boolean
  onCardClick?: () => void
}

export function DashboardStatCard({
  iconSrc,
  title,
  value,
  unit,
  viewAllHref,
  viewAllLabel = "View All",
  locale,
  isRTL,
  onCardClick,
}: DashboardStatCardProps) {
  const handleCardClick = () => {
    if (onCardClick) onCardClick()
  }

  return (
    <div
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick ? handleCardClick : undefined}
      onKeyDown={
        onCardClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleCardClick()
              }
            }
          : undefined
      }
      className={cn(
        "flex min-h-[154px] w-full min-w-0 flex-1 flex-col items-start gap-6 rounded-[8px] border border-transparent bg-white p-4 sm:gap-6",
        onCardClick && "cursor-pointer transition hover:border-[#DCEBFF] hover:shadow-sm"
      )}
    >
      {/* Header: icon + title */}
      <div className="flex items-center gap-2">
        <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center", ICON_GRADIENT_FILTER)}>
          <Image src={iconSrc} alt="" width={24} height={24} className="h-6 w-6 opacity-100" aria-hidden />
        </div>
        <h3 className="text-base font-semibold leading-[150%] text-[#262626]">{title}</h3>
      </div>

      {/* Value row */}
      <div className="flex items-end gap-1.5">
        <span className="text-[36px] font-bold leading-[150%] text-[#262626]">{value}</span>
        {unit && (
          <span className="mb-1 text-xs font-medium leading-[150%] text-[#A3A3A3]">{unit}</span>
        )}
      </div>

      {/* View All */}
      {viewAllHref ? (
      <Link
        locale={locale}
        href={viewAllHref}
        onClick={(e) => {
          if (onCardClick) {
            e.preventDefault()
            onCardClick()
          }
        }}
        className="inline-flex items-center gap-2.5 rounded-full py-1.5 group"
      >
        <span
          className="text-base font-medium leading-[150%] bg-gradient-to-r from-[#006EA8] to-[#005685] bg-clip-text text-transparent"
        >
          {viewAllLabel}
        </span>
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center text-[#40A0CA] transition-transform group-hover:translate-x-0.5",
            isRTL && "rotate-180 group-hover:-translate-x-0.5 group-hover:translate-y-0"
          )}
          aria-hidden
        >
          →
        </span>
      </Link>
      ) : null}
    </div>
  )
}
