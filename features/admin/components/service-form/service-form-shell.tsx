"use client"

import { useState } from "react"
import { useFieldArray, type UseFormReturn } from "react-hook-form"
import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Globe, Plus, X, Save, ArrowLeft } from "lucide-react"
import { LOCALES, emptyFeature, type LocaleKey, type ServiceFormValues } from "./types"
import { LocaleInput } from "./locale-input"
import { ServiceImageField } from "./service-image-field"
import { ServiceFeatureCard } from "./service-feature-card"

export function ServiceFormShell({
  locale,
  form,
  onSubmit,
  pending,
  submitError,
  success,
  submitLabel,
  pendingLabel,
  successMessage,
  backHref,
}: {
  locale: string
  form: UseFormReturn<ServiceFormValues>
  onSubmit: (data: ServiceFormValues) => void
  pending: boolean
  submitError: string | null
  success: boolean
  submitLabel: string
  pendingLabel: string
  successMessage: string
  backHref: string
}) {
  const isRTL = locale === "ar"
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({ control, name: "features" })
  const [editLocale, setEditLocale] = useState<LocaleKey>((locale as LocaleKey) || "ar")

  const imagePreview = watch("imagePreview")
  const existingImage = watch("existingImage")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <X className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <Save className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Core Service Data */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <Globe className="h-4 w-4 text-[#006EA8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
            {isRTL ? "بيانات الخدمة الأساسية" : "Core Service Data"}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs font-medium text-[#6B7280]">{isRTL ? "اللغة:" : "Language:"}</label>
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setEditLocale(loc)}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${editLocale === loc ? "bg-[#006EA8] text-white" : "bg-[#EBF5FB] text-[#006EA8]"}`}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>

        <LocaleInput
          label={isRTL ? "عنوان الخدمة" : "Service Title"}
          locale={editLocale}
          path="title"
          register={register}
          required
          error={errors.title?.[editLocale]}
        />
        <LocaleInput
          label={isRTL ? "وصف الخدمة" : "Service Description"}
          locale={editLocale}
          path="description"
          register={register}
          multiline
          required
          error={errors.description?.[editLocale]}
        />
      </div>

      <ServiceImageField
        isRTL={isRTL}
        imagePreview={imagePreview}
        existingImage={existingImage}
        onFileChange={(file, preview) => {
          setValue("imageFile", file)
          setValue("imagePreview", preview)
        }}
        onRemove={() => {
          setValue("imageFile", null)
          setValue("imagePreview", null)
        }}
        onError={(message) => form.setError("root", { message })}
      />
      {errors.root?.message && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <X className="h-4 w-4 shrink-0" />
          <span>{errors.root.message}</span>
        </div>
      )}

      {/* Features (Advantages) */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#006EA8]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
              {isRTL ? `المزايا والخصائص (${fields.length})` : `Features & Advantages (${fields.length})`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => append(emptyFeature())}
            className="flex items-center gap-1.5 rounded-lg bg-[#006EA8] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#005685] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {isRTL ? "إضافة ميزة" : "Add Feature"}
          </button>
        </div>

        {fields.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#78A3BE] bg-[#F8FBFF] py-10 text-center">
            <Globe className="mx-auto h-8 w-8 text-[#78A3BE]" />
            <p className="mt-2 text-sm text-[#9CA3AF]">
              {isRTL ? 'لا توجد مزايا. اضغط "إضافة ميزة" لإضافة أولى المزايا.' : 'No features yet. Click "Add Feature" to start.'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, fi) => (
            <ServiceFeatureCard
              key={field.id}
              index={fi}
              editLocale={editLocale}
              isRTL={isRTL}
              control={control}
              register={register}
              setValue={setValue}
              onRemove={() => remove(fi)}
              errors={errors}
            />
          ))}
        </div>
      </div>

      {/* Submit / Cancel */}
      <div className="flex items-center gap-4 pt-2">
        <PrimaryButton type="submit" disabled={pending || success} className="h-11 rounded-lg px-8 text-sm">
          <Save className="h-4 w-4 me-2 shrink-0" />
          <span>{pending ? pendingLabel : submitLabel}</span>
        </PrimaryButton>
        <Link
          locale={locale}
          href={backHref}
          className="h-11 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
          {isRTL ? "رجوع" : "Back"}
        </Link>
      </div>
    </form>
  )
}
