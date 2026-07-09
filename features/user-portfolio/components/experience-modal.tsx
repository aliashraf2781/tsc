"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { gradientTitleClasses, labelClass, inputClass, textareaClass, getFilenameFromUrl } from "../lib/style-constants"
import { createExperienceFormSchema, type ExperienceFormValues } from "../lib/experience-form-schema"
import { FileDropzoneField } from "./file-dropzone-field"
import { DateField } from "./date-field"
import type { ExperienceItem } from "../types/portfolio.types"

const emptyValues: ExperienceFormValues = {
  companyName: "",
  department: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  responsibilities: "",
  attachment: null,
  attachmentFile: null,
}

export function ExperienceModal({
  locale,
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: ExperienceItem | null
  onSave: (values: ExperienceFormValues) => void
  saving?: boolean
}) {
  const t = useTranslations("UserPortfolio")
  const isAr = locale === "ar"

  const schema = createExperienceFormSchema({
    companyRequired: t("experience.modal.errors.companyRequired"),
    departmentRequired: t("experience.modal.errors.departmentRequired"),
    startDateRequired: t("experience.modal.errors.startDateRequired"),
    endDateRequired: t("experience.modal.errors.endDateRequired"),
    responsibilitiesRequired: t("experience.modal.errors.responsibilitiesRequired"),
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              companyName: initial.companyName,
              department: initial.department,
              startDate: initial.startDate,
              endDate: initial.currentlyWorking ? "" : initial.endDate || "",
              currentlyWorking: initial.currentlyWorking,
              responsibilities: initial.responsibilities,
              attachment: initial.attachment ?? null,
              attachmentFile: null,
            }
          : emptyValues
      )
    }
  }, [open, initial, reset])

  const attachmentFile = watch("attachmentFile")
  const attachment = watch("attachment")
  const currentlyWorking = watch("currentlyWorking")

  const onSubmit = handleSubmit((values) => {
    onSave(values)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">{t("experience.modal.description")}</DialogDescription>
        <div className="flex items-center justify-between mb-5">
          <DialogTitle className={gradientTitleClasses(isAr)}>{t("experience.heading")}</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
            <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>{t("experience.modal.companyLabel")}</label>
              <input
                type="text"
                {...register("companyName")}
                placeholder={t("experience.modal.companyPlaceholder")}
                className={inputClass}
              />
              {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{t("experience.modal.departmentLabel")}</label>
              <input
                type="text"
                {...register("department")}
                placeholder={t("experience.modal.departmentPlaceholder")}
                className={inputClass}
              />
              {errors.department && <p className="text-xs text-red-600">{errors.department.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("experience.modal.periodLabel")}</label>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DateField value={field.value} onChange={field.onChange} placeholder={t("experience.modal.from")} />
                )}
              />
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DateField
                    value={field.value || ""}
                    onChange={field.onChange}
                    disabled={currentlyWorking}
                    placeholder={t("experience.modal.to")}
                    displayOverride={currentlyWorking ? t("experience.modal.untilNow") : undefined}
                  />
                )}
              />
            </div>
            {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate.message}</p>}

            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="currWork"
                checked={currentlyWorking}
                onChange={(e) => {
                  setValue("currentlyWorking", e.target.checked)
                  if (e.target.checked) setValue("endDate", "")
                }}
                className="w-4 h-4 text-[#006EA8] border-gray-300 rounded focus:ring-[#006EA8] cursor-pointer"
              />
              <label htmlFor="currWork" className="text-xs font-semibold text-gray-600 cursor-pointer">
                {t("experience.modal.currentlyWorking")}
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("experience.modal.responsibilitiesLabel")}</label>
            <textarea
              rows={3}
              {...register("responsibilities")}
              placeholder={t("experience.modal.responsibilitiesPlaceholder")}
              className={textareaClass}
            />
            {errors.responsibilities && <p className="text-xs text-red-600">{errors.responsibilities.message}</p>}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("common.attachmentsLabel")}</label>
            <FileDropzoneField
              id="expFile"
              accept=".pdf,.jpg,.jpeg,.png"
              onFileChange={(file) => setValue("attachmentFile", file, { shouldValidate: true })}
            >
              <p className="text-[#032C44] text-[13px] font-medium">
                {attachmentFile ? (
                  <span className="text-[#006EA8]">{attachmentFile.name}</span>
                ) : attachment ? (
                  <span className="text-gray-600">{getFilenameFromUrl(attachment)}</span>
                ) : (
                  t.rich("experience.modal.dropText", {
                    browse: (chunks) => <span className="text-[#006EA8] underline">{chunks}</span>,
                  })
                )}
              </p>
              <p className="text-[#006EA8] text-[10px] mt-1 font-medium">{t("experience.modal.fileTypesNote")}</p>
            </FileDropzoneField>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-10 h-[44px] border border-[#006EA8] text-[#006EA8] bg-white hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition shadow-sm cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="px-10 h-[44px] text-white font-bold rounded-[12px] text-[15px] transition bg-[#006EA8] hover:bg-[#005685] shadow-[0_4px_14px_rgba(0,110,168,0.3)] hover:shadow-[0_6px_20px_rgba(0,110,168,0.45)] cursor-pointer"
          >
            {t("common.confirm")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
