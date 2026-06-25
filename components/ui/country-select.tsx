// components/ui/country-select.tsx
// مكون اختيار الدولة مع عرض الأعلام

"use client"

import { COUNTRIES, type CountryData } from "@/lib/countries"
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
      <SelectContent className="max-h-[300px]">
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
}: {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}) {
  const selectedCountry = COUNTRIES.find((c) => c.dialCode === value)

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder={placeholder || "رمز الدولة"}>
          {selectedCountry && (
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {COUNTRIES.map((country) => (
          <SelectItem key={country.id} value={country.dialCode}>
            <span className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <span className="text-xs text-gray-500">{country.dialCode}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
