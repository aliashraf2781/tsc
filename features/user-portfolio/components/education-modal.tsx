"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { gradientTitleClasses, labelClass, inputClass, selectClass, getFilenameFromUrl } from "../lib/style-constants"
import { createEducationFormSchema, type EducationFormValues } from "../lib/education-form-schema"
import { FileDropzoneField } from "./file-dropzone-field"
import type { EducationItem } from "../types/portfolio.types"

const emptyValues: EducationFormValues = {
  university: "",
  levelOfEducation: "bachelor",
  graduationYear: new Date().getFullYear().toString(),
  specialization: "",
  finalGrade: "good",
  attachment: null,
  attachmentFile: null,
}

export function EducationModal({
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
  initial: EducationItem | null
  onSave: (values: EducationFormValues) => void
  saving?: boolean
}) {
  const t = useTranslations("UserPortfolio")
  const isAr = locale === "ar"

  const schema = createEducationFormSchema({
    universityRequired: t("education.modal.errors.universityRequired"),
    specializationRequired: t("education.modal.errors.specializationRequired"),
    graduationYearRequired: t("education.modal.errors.graduationYearRequired"),
    levelRequired: t("education.modal.errors.levelRequired"),
    gradeRequired: t("education.modal.errors.gradeRequired"),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              university: initial.university,
              levelOfEducation: initial.levelOfEducation,
              graduationYear: initial.graduationYear,
              specialization: initial.specialization,
              finalGrade: initial.finalGrade,
              attachment: initial.attachment ?? null,
              attachmentFile: null,
            }
          : emptyValues
      )
    }
  }, [open, initial, reset])

  const gradYears = useMemo(
    () => Array.from({ length: 60 }, (_, i) => (new Date().getFullYear() + 5 - i).toString()),
    []
  )

  const attachmentFile = watch("attachmentFile")
  const attachment = watch("attachment")

  const onSubmit = handleSubmit((values) => {
    onSave(values)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">{t("education.modal.description")}</DialogDescription>
        <div className="flex items-center justify-between mb-5">
          <DialogTitle className={gradientTitleClasses(isAr)}>{t("education.heading")}</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
            <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className={labelClass}>{t("education.modal.universityLabel")}</label>
            <input
              type="text"
              {...register("university")}
              placeholder={t("education.modal.universityPlaceholder")}
              className={inputClass}
            />
            {errors.university && <p className="text-xs text-red-600">{errors.university.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>{t("education.modal.levelLabel")}</label>
              <div className="relative w-full">
                <select {...register("levelOfEducation")} className={selectClass}>
                  <option value="high_school">{t("eduLevelOptions.high_school")}</option>
                  <option value="bachelor">{t("eduLevelOptions.bachelor")}</option>
                  <option value="master">{t("eduLevelOptions.master")}</option>
                  <option value="phd">{t("eduLevelOptions.phd")}</option>
                </select>
                <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pr-1">
                  <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5 opacity-70" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{t("education.modal.yearLabel")}</label>
              <div className="relative w-full">
                <select {...register("graduationYear")} className={selectClass}>
                  {gradYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pr-1">
                  <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5 opacity-70" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>{t("education.modal.specializationLabel")}</label>
              <input
                type="text"
                {...register("specialization")}
                placeholder={t("education.modal.specializationPlaceholder")}
                className={inputClass}
              />
              {errors.specialization && <p className="text-xs text-red-600">{errors.specialization.message}</p>}
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{t("education.modal.gradeLabel")}</label>
              <div className="relative w-full">
                <select {...register("finalGrade")} className={selectClass}>
                  <option value="excellent">{t("gradeOptions.excellent")}</option>
                  <option value="very_good">{t("gradeOptions.very_good")}</option>
                  <option value="good">{t("gradeOptions.good")}</option>
                  <option value="pass">{t("gradeOptions.pass")}</option>
                </select>
                <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pr-1">
                  <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5 opacity-70" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("common.attachmentsLabel")}</label>
            <FileDropzoneField
              id="eduFile"
              accept=".pdf"
              onFileChange={(file) => setValue("attachmentFile", file, { shouldValidate: true })}
            >
              <p className="text-[#032C44] text-[13px] font-medium">
                {attachmentFile ? (
                  <span className="text-[#006EA8]">{attachmentFile.name}</span>
                ) : attachment ? (
                  <span className="text-gray-600">{getFilenameFromUrl(attachment)}</span>
                ) : (
                  t.rich("education.modal.dropText", {
                    browse: (chunks) => <span className="text-[#006EA8] underline">{chunks}</span>,
                  })
                )}
              </p>
              <p className="text-[#006EA8] text-[10px] mt-1 font-medium">{t("education.modal.sizeNote")}</p>
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
