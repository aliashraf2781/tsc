"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { NewsCalendarIcon } from "@/features/news/components/news-icons"

type FieldProps = {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function JobFieldGroup({ label, required, className, children }: FieldProps) {
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
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  min?: string | number
  max?: string | number
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
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
    <div className={cn("relative w-full", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...(disabled ? { disabled: true } : {})}
        className={cn(
          underlineClass,
          "cursor-pointer appearance-none pe-10 disabled:cursor-not-allowed disabled:opacity-60 font-medium",
          !value && "text-[#B0B0B0]"
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute end-2 top-1/2 h-5 w-5 -translate-y-1/2"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path opacity="0.5" d="M12.9003 11.0247L9.74194 6.81641H5.06695C4.26695 6.81641 3.86695 7.78307 4.43361 8.34974L8.75028 12.6664C9.44195 13.3581 10.5669 13.3581 11.2586 12.6664L12.9003 11.0247Z" fill="#006EA8" />
        <path d="M14.9329 6.81641H9.74121L12.8995 11.0247L15.5745 8.34974C16.1329 7.78307 15.7329 6.81641 14.9329 6.81641Z" fill="#006EA8" />
      </svg>
    </div>
  )
}

export function JobUnderlineDate({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
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
          aria-label="Application deadline"
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
          aria-label="Open calendar"
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
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        underlineClass,
        "resize-y bg-transparent placeholder:text-[#B0B0B0] font-medium",
        className
      )}
    />
  )
}
