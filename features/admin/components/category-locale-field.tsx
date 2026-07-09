"use client"

import type { Path, UseFormRegister } from "react-hook-form"
import type { CategoryFormValues, LocaleKey } from "@/features/admin/lib/category-form-schema"

export function CategoryLocaleField({
  label,
  locale,
  register,
  fieldPath,
}: {
  label: string
  locale: LocaleKey
  register: UseFormRegister<CategoryFormValues>
  fieldPath: Path<CategoryFormValues>
}) {
  return (
    <label className="block text-sm text-[#374151]">
      <span className="mb-1 flex items-center gap-1.5 font-medium">
        <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
          {locale.toUpperCase()}
        </span>
        {label}
      </span>
      <input
        type="text"
        {...register(fieldPath)}
        className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
      />
    </label>
  )
}
