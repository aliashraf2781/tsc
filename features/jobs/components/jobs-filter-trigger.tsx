"use client"

import Image from "next/image"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"

type JobsFilterTriggerProps = {
  label: string
  activeCount?: number
  onClick: () => void
  className?: string
  "aria-expanded"?: boolean
}

export function JobsFilterTrigger({
  label,
  activeCount = 0,
  onClick,
  className,
  "aria-expanded": ariaExpanded,
}: JobsFilterTriggerProps) {
  const locale = useLocale()
  const isRTL = locale === "ar"

  return (
    <PrimaryButton
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={ariaExpanded}
      className={cn(
        "relative inline-flex h-[44px] w-auto shrink-0 items-center gap-2 rounded-[12px] px-5 text-base font-medium sm:px-7 lg:px-8",
        isRTL && "flex-row-reverse",
        className
      )}
    >
      <Image 
        src="/filter.svg" 
        alt="" 
        width={18} 
        height={20} 
        className={cn("shrink-0", isRTL && "rotate-y-180")}
      />
      <span>{label}</span>
      {activeCount > 0 ? (
        <span className={cn(
          "absolute -top-1.5 flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#006EA8] shadow-sm",
          isRTL ? "-left-1.5" : "-right-1.5"
        )}>
          {activeCount > 9 ? "9+" : activeCount}
        </span>
      ) : null}
    </PrimaryButton>
  )
}