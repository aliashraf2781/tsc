"use client"

import type { UseFormRegister, FieldError } from "react-hook-form"
import type { LocaleKey, ServiceFormValues } from "./types"

export function LocaleInput({
  label,
  locale,
  path,
  register,
  error,
  multiline = false,
  required = false,
}: {
  label: string
  locale: LocaleKey
  path: string
  register: UseFormRegister<ServiceFormValues>
  error?: FieldError
  multiline?: boolean
  required?: boolean
}) {
  const fieldName = `${path}.${locale}` as any
  const errorText =
    error?.message === "required"
      ? locale === "ar"
        ? "هذا الحقل مطلوب"
        : "This field is required"
      : error?.message

  return (
    <div>
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
            rows={3}
            {...register(fieldName)}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
          />
        ) : (
          <input
            type="text"
            {...register(fieldName)}
            className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
          />
        )}
      </label>
      {errorText && <p className="mt-1 text-xs text-red-500">{errorText}</p>}
    </div>
  )
}
