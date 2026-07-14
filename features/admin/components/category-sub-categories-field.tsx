"use client"

import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form"
import { Plus, X } from "lucide-react"
import type { CategoryFormValues, LocaleKey } from "@/features/admin/lib/category-form-schema"
import { emptyLocalizedName } from "@/features/admin/lib/category-form-utils"
import { CategoryLocaleField } from "./category-locale-field"

export function CategorySubCategoriesField({
  control,
  register,
  editLocale,
  labels,
}: {
  control: Control<CategoryFormValues>
  register: UseFormRegister<CategoryFormValues>
  editLocale: LocaleKey
  labels: {
    title: string
    add: string
    empty: string
    subCategory: string
    newItem: string
    name: string
    remove: string
  }
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "subCategories" })

  return (
    <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-[#006EA8]">{labels.title}</p>
        <button
          type="button"
          onClick={() => append({ name: emptyLocalizedName() })}
          className="flex items-center gap-1.5 rounded-lg bg-[#006EA8]/10 px-3 py-1 text-xs font-semibold text-[#006EA8] hover:bg-[#006EA8]/20 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {labels.add}
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-[#9CA3AF] text-center py-2">{labels.empty}</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={field.id} className="rounded-lg border border-[#E5E7EB] bg-white p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-1.5">
                <span className="text-xs font-bold text-[#006EA8]">
                  {labels.subCategory} {field.subCategoryId ? `#${field.subCategoryId}` : `(${labels.newItem})`}
                </span>
                <button
                  type="button"
                  title={labels.remove}
                  onClick={() => remove(idx)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <CategoryLocaleField
                label={labels.name}
                locale={editLocale}
                register={register}
                fieldPath={`subCategories.${idx}.name.${editLocale}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
