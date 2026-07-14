// components/ui/country-select.tsx
// مكون اختيار الدولة مع عرض الأعلام

"use client"

import { COUNTRIES } from "@/lib/countries"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CountrySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CountrySelect({ value, onValueChange, placeholder, disabled }: CountrySelectProps) {
  const selectedCountry = COUNTRIES.find((c) => String(c.id) === value || c.code === value)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={placeholder || "اختر الدولة"}
          defaultValue={selectedCountry?.id}
        >
          {selectedCountry && (
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        sideOffset={4}
        className="max-h-56 w-[calc(100vw-2rem)] max-w-[320px] sm:max-h-80 sm:w-[320px]"
      >
        {COUNTRIES.map((country) => (
          <SelectItem key={country.id} value={String(country.id)}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
              <span className="text-xs text-gray-500">({country.code})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * عرض علم الدولة بجانب الاسم (للقراءة فقط)
 */
export function CountryBadge({ countryId, className }: { countryId?: number; className?: string }) {
  const country = COUNTRIES.find((c) => c.id === countryId)

  if (!country) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <span className="text-xl">{country.flag}</span>
      <span>{country.name}</span>
    </div>
  )
}

/**
 * عرض فقط العلم (أيقونة)
 */
export function CountryFlag({ countryId, size = "sm" }: { countryId?: number; size?: "sm" | "md" | "lg" }) {
  const country = COUNTRIES.find((c) => c.id === countryId)

  if (!country) {
    return <span className="text-gray-400">🌍</span>
  }

  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return <span className={sizes[size]} title={country.name}>{country.flag}</span>
}

/**
 * اختيار البلد للهاتف (مع رمز الاتصال)
 */
export function CountryPhoneSelect({
  value,
  onValueChange,
  placeholder,
  className,
  contentClassName,
}: {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  contentClassName?: string
}) {
  const selectedCountry = COUNTRIES.find((c) => c.code === value)

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-9 w-auto shrink-0 gap-1", className)}>
        <SelectValue placeholder={placeholder || "رمز الدولة"}>
          {selectedCountry && (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        sideOffset={4}
        className={cn(
          "max-h-56 w-[calc(100vw-2rem)] max-w-[220px] sm:max-h-72 sm:w-[220px]",
          contentClassName
        )}
      >
        {COUNTRIES.map((country) => (
          <SelectItem key={country.id} value={country.code} className="gap-2">
            <span className="flex w-full min-w-0 items-center gap-2">
              <span className="shrink-0">{country.flag}</span>
              <span className="min-w-0 flex-1 truncate">{country.name}</span>
              <span className="shrink-0 text-xs text-gray-500">{country.dialCode}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
