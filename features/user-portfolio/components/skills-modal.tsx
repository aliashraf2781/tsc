"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { gradientTitleClasses, labelClass } from "../lib/style-constants"
import { createSkillsFormSchema, type SkillsFormValues } from "../lib/skills-form-schema"
import { SUGGESTED_SKILLS } from "../lib/suggested-skills"
import type { SkillItem } from "../types/portfolio.types"

export function SkillsModal({
  locale,
  open,
  onOpenChange,
  skills,
  onSave,
  saving,
}: {
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
  skills: SkillItem[]
  onSave: (skills: SkillItem[]) => void
  saving?: boolean
}) {
  const t = useTranslations("UserPortfolio")
  const isAr = locale === "ar"

  const [newSkillInput, setNewSkillInput] = useState("")
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)

  const schema = createSkillsFormSchema({
    atLeastOne: t("skills.modal.atLeastOneError"),
  })

  const { control, handleSubmit, reset, watch } = useForm<SkillsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { skills: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "skills" })
  const currentSkills = watch("skills")

  useEffect(() => {
    if (open) {
      reset({ skills: skills.map((s) => ({ id: s.id, skillName: s.skillName })) })
      setNewSkillInput("")
      setShowSkillDropdown(false)
    }
  }, [open, skills, reset])

  function isDuplicate(name: string) {
    return currentSkills.some((s) => s.skillName.toLowerCase() === name.toLowerCase())
  }

  function addSkill(name: string) {
    const text = name.trim()
    if (!text) return
    if (isDuplicate(text)) {
      toast.error(t("skills.modal.duplicateError"))
      return
    }
    append({ tempId: `skill-${Date.now()}`, skillName: text })
    setNewSkillInput("")
  }

  function addSuggestedSkill(name: string) {
    addSkill(name)
    setShowSkillDropdown(false)
  }

  const onSubmit = handleSubmit((values) => {
    onSave(values.skills)
    onOpenChange(false)
  })

  const suggestions = SUGGESTED_SKILLS.filter(
    (s) => s.toLowerCase().includes(newSkillInput.toLowerCase()) && !isDuplicate(s)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] p-6 rounded-[20px] bg-white border-0 shadow-lg">
        <DialogDescription className="sr-only">{t("skills.modal.description")}</DialogDescription>
        <div className="flex items-center justify-between mb-5">
          <DialogTitle className={gradientTitleClasses(isAr)}>{t("skills.heading")}</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className={labelClass}>{t("skills.modal.label")}</label>

            <div className="relative w-full">
              <div className="w-full border-b border-[#D4D4D4] focus-within:border-[#40A0CA] py-2 flex flex-wrap gap-2 items-center min-h-[42px] pe-8 relative">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-1.5 px-3 py-1 border border-[#006EA8] text-[#006EA8] bg-white rounded-full text-xs font-semibold"
                  >
                    <span>{field.skillName}</span>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="p-0.5 hover:bg-red-50 rounded-full transition flex items-center justify-center"
                      title={t("common.remove")}
                    >
                      <img src="/portfolio/remove.svg" alt="Remove" className="w-[10px] h-[10px]" />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => {
                    setNewSkillInput(e.target.value)
                    setShowSkillDropdown(true)
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill(newSkillInput)
                    }
                  }}
                  placeholder={fields.length === 0 ? t("skills.modal.placeholder") : ""}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-[#525252] border-0 p-0 focus:ring-0 focus:border-0 shadow-none rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
                >
                  <img src="/portfolio/arrow-down.svg" alt="Select" className="w-4 h-4 opacity-70" />
                </button>
              </div>

              {showSkillDropdown && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg max-h-[180px] overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addSuggestedSkill(item)}
                      className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      {item}
                    </button>
                  ))}
                  {suggestions.length === 0 && newSkillInput.trim() !== "" && (
                    <button
                      type="button"
                      onClick={() => addSkill(newSkillInput)}
                      className="w-full text-start px-4 py-2 text-sm text-[#006EA8] hover:bg-gray-50 transition font-bold"
                    >
                      {t("skills.modal.addOption", { skill: newSkillInput })}
                    </button>
                  )}
                </div>
              )}
            </div>
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
