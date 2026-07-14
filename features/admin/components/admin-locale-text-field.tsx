"use client"

import type { FieldValues, Path, UseFormRegister } from "react-hook-form"

export function AdminLocaleTextField<TFieldValues extends FieldValues>({
  label,
  locale,
  register,
  fieldPath,
  multiline = false,
  required = false,
  rows = 3,
}: {
  label: string
  locale: string
  register: UseFormRegister<TFieldValues>
  fieldPath: Path<TFieldValues>
  multiline?: boolean
  required?: boolean
  rows?: number
}) {
  return (
    <label className="block text-sm text-[#374151]">
      <span className="mb-1.5 flex items-center gap-1.5 font-medium">
        <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
          {locale.toUpperCase()}
        </span>
        <span>{label}</span>
        {required && locale === "ar" && <span className="text-red-500">*</span>}
      </span>
      {multiline ? (
        <textarea
          rows={rows}
          {...register(fieldPath)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
        />
      ) : (
        <input
          type="text"
          {...register(fieldPath)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
        />
      )}
    </label>
  )
}
