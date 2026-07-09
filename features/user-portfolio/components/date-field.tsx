"use client"

import { cn } from "@/lib/utils"

function formatDisplayDate(value: string) {
  const parts = value.split("-")
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value
}

export function DateField({
  value,
  onChange,
  disabled,
  placeholder,
  displayOverride,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder: string
  displayOverride?: string
}) {
  return (
    <div className="relative w-full">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10 [color-scheme:light] disabled:cursor-not-allowed"
        onClick={(e) => {
          try {
            e.currentTarget.showPicker()
          } catch {}
        }}
      />
      <div
        className={cn(
          "w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#525252] flex items-center justify-between pointer-events-none",
          disabled && "opacity-50"
        )}
      >
        <span className={cn(!value && !displayOverride && "text-[#A3A3A3]")}>
          {displayOverride ?? (value ? formatDisplayDate(value) : placeholder)}
        </span>
        <img src="/portfolio/calender.svg" alt="Calendar" className="w-[18px] h-[18px] opacity-70 shrink-0" />
      </div>
    </div>
  )
}
