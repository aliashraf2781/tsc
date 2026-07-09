"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { gradientTitleClasses, labelClass, inputClass, selectClass } from "../lib/style-constants"
import { createLanguageFormSchema, type LanguageFormValues } from "../lib/language-form-schema"
import type { LanguageItem } from "../types/portfolio.types"

export function LanguageModal({
  locale,
  open,
  onOpenChange,
  languages,
  onSave,
  saving,
}: {
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
  languages: LanguageItem[]
  onSave: (languages: LanguageItem[]) => void
  saving?: boolean
}) {
  const t = useTranslations("UserPortfolio")
  const isAr = locale === "ar"

  const schema = createLanguageFormSchema({
    languageRequired: t("language.modal.errors.languageRequired"),
    atLeastOne: t("language.modal.errors.atLeastOne"),
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LanguageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rows: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "rows" })

  useEffect(() => {
    if (open) {
      reset({
        rows: languages.map((l, index) => ({
          id: l.id,
          tempId: l.id ? undefined : `lang-${index}-${Date.now()}`,
          language: l.language,
          level: l.level,
        })),
      })
    }
  }, [open, languages, reset])

  const onSubmit = handleSubmit((values) => {
    onSave(values.rows)
    onOpenChange(false)
  })

  function addRow() {
    append({ tempId: `lang-new-${Date.now()}-${Math.random()}`, language: "", level: "beginner" })
  }

  const rowsError = (errors.rows as { root?: { message?: string }; message?: string } | undefined)
  const rowsErrorMessage = rowsError?.root?.message || rowsError?.message

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg">
        <DialogDescription className="sr-only">{t("language.modal.description")}</DialogDescription>
        <div className="flex items-center justify-between mb-6">
          <DialogTitle className={gradientTitleClasses(isAr)}>{t("language.heading")}</DialogTitle>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
            <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
          </button>
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-end gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex-1 space-y-1">
                <label className={labelClass}>{t("language.modal.rowLanguageLabel")}</label>
                <input
                  type="text"
                  {...register(`rows.${idx}.language` as const)}
                  placeholder={t("language.modal.rowLanguagePlaceholder")}
                  className={inputClass}
                />
                {errors.rows?.[idx]?.language && (
                  <p className="text-xs text-red-600">{errors.rows[idx]?.language?.message}</p>
                )}
              </div>

              <div className="w-[180px] space-y-1">
                <label className={labelClass}>{t("language.modal.rowLevelLabel")}</label>
                <div className="relative w-full">
                  <select {...register(`rows.${idx}.level` as const)} className={selectClass}>
                    <option value="beginner">{t("levels.beginner")}</option>
                    <option value="intermediate">{t("levels.intermediate")}</option>
                    <option value="fluent">{t("levels.fluent")}</option>
                    <option value="native">{t("levels.native")}</option>
                  </select>
                  <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pr-1">
                    <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5 opacity-70" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-2 border border-[#FF5B5C] bg-[#FFF5F5] hover:bg-[#FFE5E5] rounded-[8px] transition flex-shrink-0 mb-[1px]"
                title={t("language.modal.deleteRowTitle")}
              >
                <img src="/portfolio/remove.svg" alt="Delete" className="w-[16px] h-[16px]" />
              </button>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">{t("language.modal.empty")}</p>
          )}
        </div>

        {rowsErrorMessage && <p className="text-xs text-red-600 mt-2">{rowsErrorMessage}</p>}

        <div className="mt-4">
          <button
            type="button"
            onClick={addRow}
            className="text-sm font-bold text-[#006EA8] hover:underline flex items-center gap-1"
          >
            <span>+</span> <span>{t("language.modal.addRow")}</span>
          </button>
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
