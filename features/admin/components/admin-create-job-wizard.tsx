"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter, usePathname } from "@/i18n/navigation"
import { X } from "lucide-react"
import type { Category } from "@/lib/api/types"
import type { CreateJobPayload } from "@/lib/api/services/company.service"
import { GERMAN_STATES, JOB_GENDERS, JOB_TYPES } from "@/features/company-jobs/lib/constants"
import { buildJobFormData } from "@/features/company-jobs/lib/build-job-form-data"
import { CreateJobStepper } from "@/features/company-jobs/components/create-job-stepper"
import { JobImageUpload } from "@/features/company-jobs/components/job-image-upload"
import { getLocalizedStateName } from "@/features/jobs/lib/job-display"
import {
  JobFieldGroup,
  JobUnderlineInput,
  JobUnderlineSelect,
  JobUnderlineDate,
  JobUnderlineTextarea,
} from "@/features/company-jobs/components/job-underline-field"
import { createAdminJobAction } from "@/features/admin/actions/admin-actions"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"

type EditingLocale = "ar" | "en" | "de"

type LocalizedText = { ar: string; en: string; de: string }

type LocalizedField = "title" | "description" | "responsibilities" | "requirements"

type FormState = {
  title: LocalizedText
  companyId: string
  category_id: string
  sub_category_id: string
  state: string
  vacancy: string
  gender: string
  employment_type: string
  application_deadline: string
  salary_from: string
  salary_to: string
  age_from: string
  age_to: string
  description: LocalizedText
  responsibilities: LocalizedText
  requirements: LocalizedText
}

export type AdminCompanyOption = {
  id: number
  name: string
  logo?: string
}

function emptyLocalized(): LocalizedText {
  return { ar: "", en: "", de: "" }
}

function hasAnyValue(text: LocalizedText): boolean {
  return Object.values(text).some((value) => value.trim().length > 0)
}

const initialForm: FormState = {
  title: emptyLocalized(),
  companyId: "",
  category_id: "",
  sub_category_id: "",
  state: "",
  vacancy: "",
  gender: "",
  employment_type: "",
  application_deadline: "",
  salary_from: "",
  salary_to: "",
  age_from: "",
  age_to: "",
  description: emptyLocalized(),
  responsibilities: emptyLocalized(),
  requirements: emptyLocalized(),
}

function GradientOutlineButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-[120px] items-center justify-center rounded-lg border border-[#E8F2FF] bg-white px-4 text-base font-normal shadow-none transition hover:bg-[#F5F9FC]",
        className
      )}
    >
      <span className="bg-gradient-to-b from-[#006EA8] to-[#005685] bg-clip-text text-transparent">
        {children}
      </span>
    </button>
  )
}

export function AdminCreateJobWizard({
  categories,
  companies,
  locale,
}: {
  categories: Category[]
  companies: AdminCompanyOption[]
  locale: string
}) {
  const t = useTranslations("CompanyJobs")
  const tAdmin = useTranslations("Admin.jobs.createJob")
  const router = useRouter()
  const pathname = usePathname()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [fetchedCategories, setFetchedCategories] = useState<Category[] | null>(null)

  // Defaults to the page's own URL locale (routing only ever serves ar/en/de),
  // so the initial editing language/direction matches the page you're on.
  const [editingLocale, setEditingLocale] = useState<EditingLocale>(locale as EditingLocale)

  const isRtl = locale === "ar" || editingLocale === "ar"
  const editingDir = editingLocale === "ar" ? "rtl" : "ltr"

  // Categories are localized server-side, so switching the editing language
  // re-fetches them; the initial locale's categories come straight from props.
  const allCategories = editingLocale === locale ? categories : (fetchedCategories ?? categories)

  useEffect(() => {
    if (editingLocale === locale) return

    let cancelled = false
    fetch(`/api/categories?locale=${encodeURIComponent(editingLocale)}`)
      .then((res) => res.json())
      .then((payload: { data?: Category[] }) => {
        if (cancelled || !Array.isArray(payload.data) || payload.data.length === 0) return
        setFetchedCategories(payload.data)
      })
      .catch((err) => {
        console.warn(err)
      })

    return () => {
      cancelled = true
    }
  }, [editingLocale, locale])

  const selectedCategory = useMemo(
    () => allCategories.find((c) => String(c.id) === form.category_id),
    [allCategories, form.category_id]
  )

  const subCategories = selectedCategory?.sub_categories ?? []

  const setField = <K extends Exclude<keyof FormState, LocalizedField>>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const setLocalizedField = (field: LocalizedField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [editingLocale]: value } }))
    setError(null)
  }

  const setImage = (file: File | null, preview: string | null) => {
    if (imagePreview && imagePreview !== preview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(file)
    setImagePreview(preview)
    setError(null)
  }

  const companyOptions = companies.map((c) => ({ value: String(c.id), label: c.name }))

  const categoryOptions = allCategories
    .filter((c) => c.name?.trim())
    .map((c) => ({ value: String(c.id), label: c.name }))

  const genderOptions = JOB_GENDERS.map((g) => ({ value: g, label: t(`gender.${g}`) }))

  const jobTypeOptions = JOB_TYPES.map((jt) => ({ value: jt, label: t(`jobType.${jt}`) }))

  const stateOptions = GERMAN_STATES.map((s) => ({
    value: s,
    label: getLocalizedStateName(s, editingLocale),
  }))

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!form.companyId) {
        setError(tAdmin("errors.company"))
        return false
      }
      if (!hasAnyValue(form.title)) {
        setError(t("errors.title"))
        return false
      }
      if (!form.category_id) {
        setError(t("errors.category"))
        return false
      }
      if (!form.sub_category_id && subCategories.length > 0) {
        setError(t("errors.subCategory"))
        return false
      }
      if (!form.state) {
        setError(t("errors.state"))
        return false
      }
      if (!form.vacancy || Number(form.vacancy) < 1) {
        setError(t("errors.vacancy"))
        return false
      }
      if (!imageFile) {
        setError(t("errors.image"))
        return false
      }
    }
    if (s === 2) {
      if (!form.gender) {
        setError(t("errors.gender"))
        return false
      }
      if (!form.employment_type) {
        setError(t("errors.employmentType"))
        return false
      }
      if (!form.application_deadline) {
        setError(t("errors.deadline"))
        return false
      }
      if (!form.salary_from || !form.salary_to) {
        setError(t("errors.salary"))
        return false
      }
      if (Number(form.salary_from) > Number(form.salary_to)) {
        setError(t("errors.salaryRange"))
        return false
      }
      if (!form.age_from || !form.age_to) {
        setError(t("errors.age"))
        return false
      }
      if (Number(form.age_from) > Number(form.age_to)) {
        setError(t("errors.ageRange"))
        return false
      }
    }
    if (s === 3) {
      if (!hasAnyValue(form.description)) {
        setError(t("errors.description"))
        return false
      }
      if (!hasAnyValue(form.responsibilities)) {
        setError(t("errors.responsibilities"))
        return false
      }
      if (!hasAnyValue(form.requirements)) {
        setError(t("errors.requirements"))
        return false
      }
    }
    setError(null)
    return true
  }

  const buildPayload = (): CreateJobPayload => {
    const company = companies.find((c) => String(c.id) === form.companyId)

    return {
      title: form.title,
      category_id: Number(form.category_id),
      sub_category_id: Number(form.sub_category_id || form.category_id),
      state: form.state,
      vacancy: Number(form.vacancy),
      gender: form.gender as CreateJobPayload["gender"],
      employment_type: form.employment_type as CreateJobPayload["employment_type"],
      application_deadline: form.application_deadline,
      salary_from: Number(form.salary_from),
      salary_to: Number(form.salary_to),
      age_from: Number(form.age_from),
      age_to: Number(form.age_to),
      description: form.description,
      responsibilities: form.responsibilities,
      requirements: form.requirements,
      image: imageFile!,
      company: company ? { id: company.id, name: company.name, logo: company.logo } : undefined,
    }
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = () => {
    if (!validateStep(3) || !imageFile) {
      if (!imageFile) setError(t("errors.image"))
      return
    }
    startTransition(async () => {
      try {
        const formData = buildJobFormData(buildPayload())
        const result = await createAdminJobAction(formData, locale)
        if (!result.ok) {
          setError(result.message ?? tAdmin("loadError"))
          return
        }
        router.push("/dashboard/admin/jobs")
      } catch (err) {
        console.error(err)
        setError(tAdmin("loadError"))
      }
    })
  }

  const stepLabels: [string, string, string] = [t("steps.basic"), t("steps.info"), t("steps.description")]

  const canSubmitStep = categoryOptions.length > 0 && companyOptions.length > 0

  return (
    <div
      dir={editingDir}
      className={cn(
        "relative flex w-full flex-col items-stretch gap-4 rounded-lg bg-white p-4 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:gap-5 sm:p-6",
        pending && "pointer-events-none opacity-80"
      )}
    >
      <div className="w-full flex flex-col gap-2">
        <div className="flex flex-col items-center gap-3 w-full sm:flex-row sm:justify-between px-8 sm:px-0">
          <h1
            className={cn(
              "bg-clip-text text-[24px] font-bold leading-[1.3] text-transparent sm:text-[32px] py-1 text-center sm:text-start flex-1",
              isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l",
              "from-[#032C44] to-[#41A0CA]"
            )}
          >
            {tAdmin("title")}
          </h1>
          {/* Language switcher — shown on all steps for consistency */}
          <div className="flex gap-1.5 justify-center sm:justify-start shrink-0">
            {(["ar", "en", "de"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setEditingLocale(l)
                  router.replace(pathname, { locale: l })
                }}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  editingLocale === l
                    ? "bg-gradient-to-b from-[#006EA8] to-[#005685] text-white shadow-sm"
                    : "bg-[#F5F9FC] border border-[#E0E8EF] text-[#006EA8] hover:bg-[#E6F6FF]"
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute top-3 end-3">
          <Link
            locale={locale}
            href="/dashboard/admin/jobs"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#006EA8] transition-opacity hover:opacity-70 bg-white shadow-sm"
            aria-label={t("cancel")}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <CreateJobStepper currentStep={step} labels={stepLabels} isRtl={isRtl} />

      <div className="flex w-full flex-col gap-4">
        {step === 1 && (
          <>
            <JobFieldGroup label={tAdmin("fields.company")} required>
              <JobUnderlineSelect
                value={form.companyId}
                onChange={(v) => setField("companyId", v)}
                placeholder={tAdmin("placeholders.company")}
                options={companyOptions}
                disabled={companyOptions.length === 0}
              />
            </JobFieldGroup>

            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center gap-0.5 text-start">
                <span className="text-base font-medium leading-[150%] text-[#262626]">{t("fields.title")}</span>
                <span className="text-base font-medium leading-[150%] text-[#FF2D55]">*</span>
              </div>

              <JobUnderlineInput
                value={form.title[editingLocale]}
                onChange={(v) => setLocalizedField("title", v)}
                placeholder={t("placeholders.title")}
                dir={editingDir}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <JobFieldGroup label={t("fields.category")} required>
                <JobUnderlineSelect
                  value={form.category_id}
                  onChange={(v) => {
                    setField("category_id", v)
                    setField("sub_category_id", "")
                  }}
                  placeholder={t("placeholders.select")}
                  options={categoryOptions}
                  disabled={categoryOptions.length === 0}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.subCategory")} required>
                <JobUnderlineSelect
                  value={form.sub_category_id}
                  onChange={(v) => setField("sub_category_id", v)}
                  placeholder={t("placeholders.select")}
                  disabled={!form.category_id || pending}
                  options={
                    subCategories.length > 0
                      ? subCategories.map((s) => ({ value: String(s.id), label: s.name }))
                      : form.category_id
                        ? [{ value: form.category_id, label: t("fields.sameAsCategory") }]
                        : []
                  }
                />
              </JobFieldGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <JobFieldGroup label={t("fields.state")} required>
                <JobUnderlineSelect
                  value={form.state}
                  onChange={(v) => setField("state", v)}
                  placeholder={t("placeholders.select")}
                  options={stateOptions}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.vacancy")} required>
                <JobUnderlineInput
                  type="number"
                  min={1}
                  value={form.vacancy}
                  onChange={(v) => setField("vacancy", v)}
                  placeholder="20"
                />
              </JobFieldGroup>
            </div>

            <div className="w-full">
              <JobImageUpload
                file={imageFile}
                previewUrl={imagePreview}
                onChange={setImage}
                label={t("fields.image")}
                hint={t("placeholders.image")}
                removeLabel={t("removeImage")}
                compressingLabel={t("compressing")}
                sizeHintLabel={t("imageSizeHint")}
                tooLargeLabel={t("errors.imageSize")}
                compressFailedLabel={t("errors.imageCompress")}
                className="flex-col"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <JobFieldGroup label={t("fields.gender")} required>
                <JobUnderlineSelect
                  value={form.gender}
                  onChange={(v) => setField("gender", v)}
                  placeholder={t("placeholders.select")}
                  options={genderOptions}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.employmentType")} required>
                <JobUnderlineSelect
                  value={form.employment_type}
                  onChange={(v) => setField("employment_type", v)}
                  placeholder={t("placeholders.select")}
                  options={jobTypeOptions}
                />
              </JobFieldGroup>
            </div>

            <JobFieldGroup label={t("fields.deadline")} required>
              <JobUnderlineDate
                value={form.application_deadline}
                onChange={(v) => setField("application_deadline", v)}
              />
            </JobFieldGroup>

            <JobFieldGroup label={t("fields.salary")} required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <JobUnderlineInput
                  type="number"
                  min={0}
                  value={form.salary_from}
                  onChange={(v) => setField("salary_from", v)}
                  placeholder={t("placeholders.salaryFrom")}
                />
                <JobUnderlineInput
                  type="number"
                  min={0}
                  value={form.salary_to}
                  onChange={(v) => setField("salary_to", v)}
                  placeholder={t("placeholders.salaryTo")}
                />
              </div>
            </JobFieldGroup>

            <JobFieldGroup label={t("fields.age")} required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <JobUnderlineInput
                  type="number"
                  min={18}
                  value={form.age_from}
                  onChange={(v) => setField("age_from", v)}
                  placeholder={t("placeholders.ageFrom")}
                />
                <JobUnderlineInput
                  type="number"
                  min={18}
                  value={form.age_to}
                  onChange={(v) => setField("age_to", v)}
                  placeholder={t("placeholders.ageTo")}
                />
              </div>
            </JobFieldGroup>
          </>
        )}

        {step === 3 && (
          <>
            <JobFieldGroup label={t("fields.description")} required>
              <JobUnderlineTextarea
                value={form.description[editingLocale]}
                onChange={(v) => setLocalizedField("description", v)}
                rows={4}
                dir={editingDir}
              />
            </JobFieldGroup>
            <JobFieldGroup label={t("fields.responsibilities")} required>
              <JobUnderlineTextarea
                value={form.responsibilities[editingLocale]}
                onChange={(v) => setLocalizedField("responsibilities", v)}
                rows={4}
                dir={editingDir}
              />
            </JobFieldGroup>
            <JobFieldGroup label={t("fields.requirements")} required>
              <JobUnderlineTextarea
                value={form.requirements[editingLocale]}
                onChange={(v) => setLocalizedField("requirements", v)}
                rows={4}
                dir={editingDir}
              />
            </JobFieldGroup>
          </>
        )}

        {categoryOptions.length === 0 ? (
          <p className="text-center text-sm text-[#FF2D55]" role="status">
            {t("errors.categoriesUnavailable")}
          </p>
        ) : null}

        {companyOptions.length === 0 ? (
          <p className="text-center text-sm text-[#FF2D55]" role="status">
            {tAdmin("errors.companiesUnavailable")}
          </p>
        ) : null}

        {error ? (
          <p className="text-center text-sm leading-relaxed text-[#FF2D55]" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:flex-nowrap">
        {step === 1 ? (
          <GradientOutlineButton onClick={() => router.push("/dashboard/admin/jobs")}>
            {t("cancel")}
          </GradientOutlineButton>
        ) : (
          <GradientOutlineButton onClick={() => setStep(step - 1)}>{t("back")}</GradientOutlineButton>
        )}

        {step < 3 ? (
          <PrimaryButton
            type="button"
            onClick={handleNext}
            disabled={pending || !canSubmitStep}
            className="h-9 min-w-[120px] w-auto rounded-lg px-4 text-base font-normal"
          >
            {t("next")}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            type="button"
            onClick={handleSubmit}
            disabled={pending || !canSubmitStep}
            className="h-9 min-w-[120px] w-auto rounded-lg px-4 text-base font-normal"
          >
            {pending ? t("submitting") : t("submit")}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}
