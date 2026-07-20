"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { usePortfolioData } from "../hooks/use-portfolio-data"
import { CvUploadSection } from "./cv-upload-section"
import { LanguageSection } from "./language-section"
import { LanguageModal } from "./language-modal"
import { EducationSection } from "./education-section"
import { EducationModal } from "./education-modal"
import { ExperienceSection } from "./experience-section"
import { ExperienceModal } from "./experience-modal"
import { SkillsSection } from "./skills-section"
import { SkillsModal } from "./skills-modal"
import { PortfolioSubmitBar } from "./portfolio-submit-bar"
import type { EducationFormValues } from "../lib/education-form-schema"
import type { ExperienceFormValues } from "../lib/experience-form-schema"
import type { EducationItem, ExperienceItem } from "../types/portfolio.types"

export function UserPortfolioPage({
  locale,
  initialPortfolio,
}: {
  locale: string
  initialPortfolio?: Record<string, any>
}) {
  const t = useTranslations("UserPortfolio")
  const isAr = locale === "ar"

  const {
    cv,
    cvFile,
    languages,
    educations,
    experiences,
    skills,
    loading,
    saving,
    isDirty,
    stageCvFile,
    clearStagedCvFile,
    removeCv,
    setLanguages,
    setEducations,
    setExperiences,
    setSkills,
    savePortfolio,
  } = usePortfolioData(locale, initialPortfolio)

  const [languageModalOpen, setLanguageModalOpen] = useState(false)
  const [educationModalOpen, setEducationModalOpen] = useState(false)
  const [experienceModalOpen, setExperienceModalOpen] = useState(false)
  const [skillModalOpen, setSkillModalOpen] = useState(false)

  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null)
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null)

  function openAddEducation() {
    setEditingEducation(null)
    setEducationModalOpen(true)
  }

  function openEditEducation(item: EducationItem) {
    setEditingEducation(item)
    setEducationModalOpen(true)
  }

  function deleteEducationItem(index: number) {
    if (educations.length <= 1) {
      toast.error(t("education.modal.errors.atLeastOne"))
      return
    }
    setEducations((prev) => prev.filter((_, idx) => idx !== index))
  }

  function saveEducation(values: EducationFormValues) {
    setEducationModalOpen(false)
    if (editingEducation) {
      setEducations((prev) =>
        prev.map((item) =>
          (item.id && item.id === editingEducation.id) ||
          (item.tempId && item.tempId === editingEducation.tempId)
            ? { ...item, ...values }
            : item
        )
      )
    } else {
      setEducations((prev) => [...prev, { tempId: `edu-new-${Date.now()}`, ...values }])
    }
  }

  function openAddExperience() {
    setEditingExperience(null)
    setExperienceModalOpen(true)
  }

  function openEditExperience(item: ExperienceItem) {
    setEditingExperience(item)
    setExperienceModalOpen(true)
  }

  function deleteExperienceItem(index: number) {
    if (experiences.length <= 1) {
      toast.error(t("experience.modal.errors.atLeastOne"))
      return
    }
    setExperiences((prev) => prev.filter((_, idx) => idx !== index))
  }

  function saveExperience(values: ExperienceFormValues) {
    setExperienceModalOpen(false)
    if (editingExperience) {
      setExperiences((prev) =>
        prev.map((item) =>
          (item.id && item.id === editingExperience.id) ||
          (item.tempId && item.tempId === editingExperience.tempId)
            ? { ...item, ...values }
            : item
        )
      )
    } else {
      setExperiences((prev) => [...prev, { tempId: `exp-new-${Date.now()}`, ...values }])
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006EA8] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-10" dir={isAr ? "rtl" : "ltr"}>
      <CvUploadSection
        locale={locale}
        cv={cv}
        cvFile={cvFile}
        onFileSelected={stageCvFile}
        onClear={clearStagedCvFile}
        onRemove={removeCv}
      />

      <LanguageSection locale={locale} languages={languages} onEdit={() => setLanguageModalOpen(true)} />

      <EducationSection
        locale={locale}
        educations={educations}
        onAdd={openAddEducation}
        onEdit={openEditEducation}
        onDelete={deleteEducationItem}
      />

      <ExperienceSection
        locale={locale}
        experiences={experiences}
        onAdd={openAddExperience}
        onEdit={openEditExperience}
        onDelete={deleteExperienceItem}
      />

      <SkillsSection locale={locale} skills={skills} onEdit={() => setSkillModalOpen(true)} />

      <PortfolioSubmitBar saving={saving} disabled={!isDirty} onSubmit={savePortfolio} />

      <LanguageModal
        locale={locale}
        open={languageModalOpen}
        onOpenChange={setLanguageModalOpen}
        languages={languages}
        onSave={setLanguages}
        saving={saving}
      />

      <EducationModal
        locale={locale}
        open={educationModalOpen}
        onOpenChange={setEducationModalOpen}
        initial={editingEducation}
        onSave={saveEducation}
        saving={saving}
      />

      <ExperienceModal
        locale={locale}
        open={experienceModalOpen}
        onOpenChange={setExperienceModalOpen}
        initial={editingExperience}
        onSave={saveExperience}
        saving={saving}
      />

      <SkillsModal
        locale={locale}
        open={skillModalOpen}
        onOpenChange={setSkillModalOpen}
        skills={skills}
        onSave={setSkills}
        saving={saving}
      />
    </div>
  )
}
