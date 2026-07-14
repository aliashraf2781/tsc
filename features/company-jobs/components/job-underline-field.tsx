"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { NewsCalendarIcon } from "@/features/news/components/news-icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FieldProps = {
  label: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}

export function JobFieldGroup({ label, required, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2 sm:gap-3", className)}>
      <div className="flex items-center gap-1">
        <span className="text-sm sm:text-base font-semibold leading-tight text-[#262626]">
          {label}
        </span>
        {required ? (
          <span className="text-sm sm:text-base font-semibold leading-tight text-[#FF2D55]">
            *
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-[#FF2D55]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const underlineClass =
  "flex w-full items-center gap-2 border-b-2 border-[#E0E0E0] py-3 px-0 text-sm sm:text-base text-[#525252] outline-none transition-colors focus:border-[#006EA8] focus:border-b-2 min-h-[48px] sm:min-h-[52px]"

export function JobUnderlineInput({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  className,
  dir,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  min?: string | number
  max?: string | number
  className?: string
  dir?: "rtl" | "ltr"
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      dir={dir}
      className={cn(
        underlineClass,
        "bg-transparent placeholder:text-[#B0B0B0] font-medium",
        className
      )}
    />
  )
}

export function JobUnderlineSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-12 w-full min-h-[48px] justify-between rounded-xl border border-[#E0E0E0] bg-white px-4 text-sm font-medium text-[#525252] shadow-none transition-colors hover:border-[#006EA8]/50 focus-visible:border-[#006EA8] focus-visible:ring-[#006EA8]/20 data-placeholder:text-[#B0B0B0] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[52px] sm:text-base",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={6}
        className="max-h-[min(18rem,var(--radix-select-content-available-height,600px))]"
      >
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function JobUnderlineDate({
  value,
  onChange,
  className,
  ariaLabel,
  openLabel,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  ariaLabel?: string
  openLabel?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const minDate = new Date().toISOString().slice(0, 10)

  const openPicker = () => {
    const el = inputRef.current
    if (!el) return
    el.focus()
    try {
      if (typeof el.showPicker === "function") el.showPicker()
    } catch {
      el.click()
    }
  }

  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : ""

  return (
    <div className={cn("relative w-full", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openPicker()
          }
        }}
        className={cn(underlineClass, "cursor-pointer gap-3")}
      >
        <input
          ref={inputRef}
          type="date"
          value={value}
          min={minDate}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel}
          tabIndex={-1}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <span className={cn(
          "flex-1 text-sm sm:text-base font-medium",
          displayValue ? "text-[#525252]" : "text-[#B0B0B0]"
        )}>
          {displayValue || "—"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            openPicker()
          }}
          className="shrink-0 rounded p-1 transition hover:bg-[#E6F6FF]"
          aria-label={openLabel}
        >
          <NewsCalendarIcon className="h-5 w-5 text-[#006EA8]" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export function JobUnderlineTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  dir,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
  dir?: "rtl" | "ltr"
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      dir={dir}
      className={cn(
        underlineClass,
        "resize-y bg-transparent placeholder:text-[#B0B0B0] font-medium",
        className
      )}
    />
  )
}
