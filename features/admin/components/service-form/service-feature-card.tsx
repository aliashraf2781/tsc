"use client"

import Image from "next/image"
import { Globe, X } from "lucide-react"
import { useWatch, type Control, type UseFormRegister, type UseFormSetValue, type FieldErrors } from "react-hook-form"
import type { LocaleKey, ServiceFormValues } from "./types"
import { LocaleInput } from "./locale-input"

export function ServiceFeatureCard({
  index,
  editLocale,
  isRTL,
  control,
  register,
  setValue,
  onRemove,
  errors,
}: {
  index: number
  editLocale: LocaleKey
  isRTL: boolean
  control: Control<ServiceFormValues>
  register: UseFormRegister<ServiceFormValues>
  setValue: UseFormSetValue<ServiceFormValues>
  onRemove: () => void
  errors?: FieldErrors<ServiceFormValues>
}) {
  // Read the feature's real database id via watch — useFieldArray's own
  // `field.id` (used for the React key) is an internal RHF key, not this.
  const featureId = useWatch({ control, name: `features.${index}.id` as any }) as number | undefined
  const icon = useWatch({ control, name: `features.${index}.icon` as any }) as string
  const iconPreview = useWatch({ control, name: `features.${index}.iconPreview` as any }) as string | null | undefined

  function handleIconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setValue(`features.${index}.iconFile` as any, file)
    setValue(`features.${index}.iconPreview` as any, preview)
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#006EA8]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF4FB] text-[10px] font-bold text-[#006EA8]">
            {index + 1}
          </span>
          {isRTL ? "ميزة" : "Feature"} {featureId ? `(ID: ${featureId})` : `(${isRTL ? "جديدة" : "New"})`}
        </span>
        <button
          type="button"
          title={isRTL ? "حذف الميزة" : "Remove feature"}
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <LocaleInput
        label={isRTL ? "عنوان الميزة" : "Feature Title"}
        locale={editLocale}
        path={`features.${index}.title`}
        register={register}
        error={errors?.features?.[index]?.title?.[editLocale]}
      />
      <LocaleInput
        label={isRTL ? "وصف الميزة" : "Feature Description"}
        locale={editLocale}
        path={`features.${index}.description`}
        register={register}
        multiline
        error={errors?.features?.[index]?.description?.[editLocale]}
      />

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#40A0CA] bg-white">
          {iconPreview ? (
            <Image src={iconPreview} alt="" width={24} height={24} className="h-6 w-6 object-contain" unoptimized />
          ) : icon && (icon.startsWith("/") || icon.startsWith("http")) ? (
            <Image src={icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" unoptimized />
          ) : (
            <Globe className="h-6 w-6 text-[#40A0CA]" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="block text-xs text-[#6B7280]">
            {isRTL ? "رابط الأيقونة (URL أو مسار)" : "Icon URL / Path"}
            <input
              type="text"
              {...register(`features.${index}.icon` as any)}
              placeholder="/icons/my-icon.svg or https://..."
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
            />
          </label>
          <label className="cursor-pointer inline-block text-xs font-medium text-[#006EA8] hover:underline">
            {isRTL ? "أو رفع ملف أيقونة" : "Or upload icon file"}
            <input type="file" accept="image/*,image/svg+xml" className="hidden" onChange={handleIconFile} />
          </label>
        </div>
      </div>
    </div>
  )
}
