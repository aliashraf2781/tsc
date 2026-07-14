"use client"

import { useFieldArray, useWatch, type Control, type UseFormRegister, type UseFormSetValue } from "react-hook-form"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Globe, Plus, X } from "lucide-react"
import type { LocaleKey, ServiceFormValues } from "@/features/admin/lib/service-form-schema"
import { emptyServiceFeature } from "@/features/admin/lib/service-form-utils"
import { AdminLocaleTextField } from "./admin-locale-text-field"

function ServiceFeatureItem({
  index,
  control,
  register,
  setValue,
  editLocale,
  onRemove,
}: {
  index: number
  control: Control<ServiceFormValues>
  register: UseFormRegister<ServiceFormValues>
  setValue: UseFormSetValue<ServiceFormValues>
  editLocale: LocaleKey
  onRemove: () => void
}) {
  const t = useTranslations("Admin.services")
  const feature = useWatch({ control, name: `features.${index}` })

  function handleIconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setValue(`features.${index}.iconFile`, file, { shouldDirty: true })
    setValue(`features.${index}.iconPreview`, URL.createObjectURL(file), { shouldDirty: true })
  }

  const iconPreviewSrc =
    feature?.iconPreview || (feature?.icon && (feature.icon.startsWith("/") || feature.icon.startsWith("http")) ? feature.icon : null)

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#006EA8]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF4FB] text-[10px] font-bold text-[#006EA8]">
            {index + 1}
          </span>
          {t("feature")} {feature?.id ? `(ID: ${feature.id})` : `(${t("newItem")})`}
        </span>
        <button
          type="button"
          title={t("removeFeature")}
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <AdminLocaleTextField<ServiceFormValues>
        key={`title-${editLocale}`}
        label={t("featureTitle")}
        locale={editLocale}
        register={register}
        fieldPath={`features.${index}.title.${editLocale}`}
      />
      <AdminLocaleTextField<ServiceFormValues>
        key={`description-${editLocale}`}
        label={t("featureDescription")}
        locale={editLocale}
        register={register}
        fieldPath={`features.${index}.description.${editLocale}`}
        multiline
      />

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#40A0CA] bg-white">
          {iconPreviewSrc ? (
            <Image src={iconPreviewSrc} alt="" width={24} height={24} className="h-6 w-6 object-contain" unoptimized />
          ) : (
            <Globe className="h-6 w-6 text-[#40A0CA]" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="block text-xs text-[#6B7280]">
            {t("iconUrlLabel")}
            <input
              type="text"
              {...register(`features.${index}.icon`)}
              placeholder={t("iconUrlPlaceholder")}
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
            />
          </label>
          <label className="cursor-pointer inline-block text-xs font-medium text-[#006EA8] hover:underline">
            {t("orUploadIconFile")}
            <input type="file" accept="image/*,image/svg+xml" className="hidden" onChange={handleIconFile} />
          </label>
        </div>
      </div>
    </div>
  )
}

export function ServiceFeaturesField({
  control,
  register,
  setValue,
  editLocale,
}: {
  control: Control<ServiceFormValues>
  register: UseFormRegister<ServiceFormValues>
  setValue: UseFormSetValue<ServiceFormValues>
  editLocale: LocaleKey
}) {
  const t = useTranslations("Admin.services")
  const { fields, append, remove } = useFieldArray({ control, name: "features" })

  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-[#006EA8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
            {t("featuresAndAdvantages", { count: fields.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => append(emptyServiceFeature())}
          className="flex items-center gap-1.5 rounded-lg bg-[#006EA8] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#005685] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addFeature")}
        </button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#78A3BE] bg-[#F8FBFF] py-10 text-center">
          <Globe className="mx-auto h-8 w-8 text-[#78A3BE]" />
          <p className="mt-2 text-sm text-[#9CA3AF]">{t("noFeaturesYet")}</p>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <ServiceFeatureItem
            key={field.id}
            index={index}
            control={control}
            register={register}
            setValue={setValue}
            editLocale={editLocale}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
    </div>
  )
}
