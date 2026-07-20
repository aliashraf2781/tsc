"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { mapPortfolioFromBackend } from "../lib/portfolio-mapper"
import { buildPortfolioFormData } from "../lib/portfolio-form-data"
import type { EducationItem, ExperienceItem, LanguageItem, SkillItem } from "../types/portfolio.types"

export function usePortfolioData(locale: string, initialPortfolio?: Record<string, any>) {
  const t = useTranslations("UserPortfolio")

  const [cv, setCv] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvRemoved, setCvRemoved] = useState(false)
  const [languages, setLanguages] = useState<LanguageItem[]>([])
  const [educations, setEducations] = useState<EducationItem[]>([])
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [skills, setSkills] = useState<SkillItem[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Snapshot of the last loaded/saved data, used to detect unsaved changes.
  const savedSnapshotRef = useRef<string | null>(null)

  // Guards against duplicate in-flight submits (e.g. a fast double-click before
  // `saving` re-renders the disabled button) sending stale record ids.
  const isSavingRef = useRef(false)

  const applyData = useCallback((data: any) => {
    const mapped = mapPortfolioFromBackend(data)
    setCv(mapped.cv)
    setCvRemoved(false)
    setLanguages(mapped.languages)
    setEducations(mapped.educations)
    setExperiences(mapped.experiences)
    setSkills(mapped.skills)
    savedSnapshotRef.current = JSON.stringify({
      cv: mapped.cv,
      languages: mapped.languages,
      educations: mapped.educations,
      experiences: mapped.experiences,
      skills: mapped.skills,
    })
  }, [])

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/user/portfolio", {
        headers: { "x-locale": locale, "accept-language": locale },
      })

      // 401 = session expired – no toast, just leave the form empty
      if (res.status === 401) {
        setLoading(false)
        return
      }

      const resData = await res.json()
      if (!res.ok) throw new Error(resData.message || "Failed to load portfolio data")

      applyData(resData.data || resData)
    } catch (err) {
      console.error("[Load error]", err)
      toast.error(t("cv.loadError"))
    } finally {
      setLoading(false)
    }
  }, [locale, applyData, t])

  useEffect(() => {
    if (initialPortfolio && Object.keys(initialPortfolio).length > 0) {
      applyData(initialPortfolio.data || initialPortfolio)
      setLoading(false)
    } else {
      loadPortfolio()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPortfolio, locale])

  // Submit the entire portfolio using FormData (API expects arrays to be sent).
  // This is the ONLY place that talks to the backend for writes — every other
  // handler just updates local state, so validation only ever runs here, when
  // the user explicitly clicks the page-level Submit button.
  const savePortfolio = useCallback(async () => {
    if (isSavingRef.current) return
    if (languages.length === 0) {
      toast.error(t("validation.languagesRequired"))
      return
    }
    if (educations.length === 0) {
      toast.error(t("validation.educationsRequired"))
      return
    }
    if (experiences.length === 0) {
      toast.error(t("validation.experiencesRequired"))
      return
    }
    if (skills.length === 0) {
      toast.error(t("validation.skillsRequired"))
      return
    }

    try {
      isSavingRef.current = true
      setSaving(true)

      const formData = buildPortfolioFormData({ cvFile, cvRemoved, languages, educations, experiences, skills })

      const res = await fetch("/api/user/portfolio", {
        method: "POST",
        headers: { "x-locale": locale, "accept-language": locale },
        body: formData,
      })

      const resData = await res.json()
      if (!res.ok) {
        let errorMsg = resData.message || ""
        if (resData.errors) {
          const details = Object.values(resData.errors).flat().join(", ")
          if (details) errorMsg = `${errorMsg}: ${details}`
        }
        throw new Error(errorMsg || "Failed to save portfolio")
      }

      toast.success(t("saveSuccess"))
      setCvFile(null)
      setCvRemoved(false)
      await loadPortfolio()
    } catch (err: any) {
      console.error("[Save error]", err)
      toast.error(err.message || t("saveError"))
    } finally {
      isSavingRef.current = false
      setSaving(false)
    }
  }, [locale, cvFile, cvRemoved, languages, educations, experiences, skills, loadPortfolio, t])

  const stageCvFile = useCallback((file: File) => {
    setCvFile(file)
    setCvRemoved(false)
  }, [])

  const clearStagedCvFile = useCallback(() => {
    setCvFile(null)
  }, [])

  const removeCv = useCallback(() => {
    setCv(null)
    setCvFile(null)
    setCvRemoved(true)
  }, [])

  const isDirty = useMemo(() => {
    if (loading) return false
    if (cvFile || cvRemoved) return true
    if (savedSnapshotRef.current === null) return false
    const current = JSON.stringify({ cv, languages, educations, experiences, skills })
    return current !== savedSnapshotRef.current
  }, [loading, cv, cvFile, cvRemoved, languages, educations, experiences, skills])

  return {
    cv,
    cvFile,
    languages,
    educations,
    experiences,
    skills,
    loading,
    saving,
    isDirty,
    setLanguages,
    setEducations,
    setExperiences,
    setSkills,
    stageCvFile,
    clearStagedCvFile,
    removeCv,
    savePortfolio,
  }
}
