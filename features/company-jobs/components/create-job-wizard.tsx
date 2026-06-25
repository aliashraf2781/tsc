"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { X } from "lucide-react"
import type { Category } from "@/lib/api/types"
import type { CreateJobPayload } from "@/lib/api/services/company.service"
import { GERMAN_STATES, JOB_GENDERS, JOB_TYPES } from "@/features/company-jobs/lib/constants"
import { buildJobFormData } from "@/features/company-jobs/lib/build-job-form-data"
import { CreateJobStepper } from "@/features/company-jobs/components/create-job-stepper"
import { JobImageUpload } from "@/features/company-jobs/components/job-image-upload"
import { useAuth } from "@/hooks/use-auth"
import { getLocalizedStateName } from "@/features/jobs/lib/job-display"
import {
  JobFieldGroup,
  JobUnderlineInput,
  JobUnderlineSelect,
  JobUnderlineDate,
  JobUnderlineTextarea,
} from "@/features/company-jobs/components/job-underline-field"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"

type FormState = {
  title_ar: string
  title_en: string
  title_de: string
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
  description_ar: string
  description_en: string
  description_de: string
  responsibilities_ar: string
  responsibilities_en: string
  responsibilities_de: string
  requirements_ar: string
  requirements_en: string
  requirements_de: string
}

const initialForm: FormState = {
  title_ar: "",
  title_en: "",
  title_de: "",
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
  description_ar: "",
  description_en: "",
  description_de: "",
  responsibilities_ar: "",
  responsibilities_en: "",
  responsibilities_de: "",
  requirements_ar: "",
  requirements_en: "",
  requirements_de: "",
}

function GradientOutlineButton({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: "button"
  className?: string
}) {
  return (
    <button
      type={type}
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

export function CreateJobWizard({
  categories,
  locale,
}: {
  categories: Category[]
  locale: string
}) {
  const t = useTranslations("CompanyJobs")
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [remoteCategories, setRemoteCategories] = useState<Category[]>([])
  const { user } = useAuth()

  const [editingLocale, setEditingLocale] = useState<"ar" | "en" | "de">(
    (locale === "ar" || locale === "en" || locale === "de") ? (locale as "ar" | "en" | "de") : "ar"
  )

  const isRtl = locale === "ar"

  const allCategories = remoteCategories.length > 0 ? remoteCategories : categories

  useEffect(() => {
    if (editingLocale === locale && categories.length > 0) {
      setRemoteCategories(categories)
      return
    }

    let cancelled = false
    fetch(`/api/categories?locale=${encodeURIComponent(editingLocale)}`)
      .then((res) => res.json())
      .then((payload: { data?: Category[] }) => {
        if (cancelled || !Array.isArray(payload.data) || payload.data.length === 0) return
        setRemoteCategories(payload.data)
      })
      .catch((err) => {
        console.warn(err)
      })

    return () => {
      cancelled = true
    }
  }, [editingLocale, locale, categories])

  const selectedCategory = useMemo(
    () => allCategories.find((c) => String(c.id) === form.category_id),
    [allCategories, form.category_id]
  )

  const subCategories = selectedCategory?.sub_categories ?? []

  const categoryOptions = allCategories
    .filter((c) => c.name?.trim())
    .map((c) => ({
      value: String(c.id),
      label: c.name,
    }))

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
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

  const genderOptions = JOB_GENDERS.map((g) => ({
    value: g,
    label: t(`gender.${g}`),
  }))

  const jobTypeOptions = JOB_TYPES.map((jt) => ({
    value: jt,
    label: t(`jobType.${jt}`),
  }))

  const stateOptions = GERMAN_STATES.map((s) => ({ value: s, label: getLocalizedStateName(s, editingLocale) }))

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      const hasTitle = [form.title_ar, form.title_en, form.title_de].some((v) => v && v.trim())
      if (!hasTitle) {
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
      const hasDescription = [form.description_ar, form.description_en, form.description_de].some((v) => v && v.trim())
      const hasResponsibilities = [form.responsibilities_ar, form.responsibilities_en, form.responsibilities_de].some((v) => v && v.trim())
      const hasRequirements = [form.requirements_ar, form.requirements_en, form.requirements_de].some((v) => v && v.trim())
      if (!hasDescription) {
        setError(t("errors.description"))
        return false
      }
      if (!hasResponsibilities) {
        setError(t("errors.responsibilities"))
        return false
      }
      if (!hasRequirements) {
        setError(t("errors.requirements"))
        return false
      }
    }
    setError(null)
    return true
  }

  const buildPayload = (): CreateJobPayload => {
    // The auth hook already sets user.avatar = companyLogo for company accounts.
    // Also try companyProfile/company sub-objects for id, name, logo.
    const cp = (user as any)?.companyProfile || (user as any)?.company_profile || (user as any)?.company || undefined
    const company = user
      ? {
          id: cp?.id ? Number(cp.id) : undefined,
          name: (cp?.companyName || cp?.name || cp?.company_name || user.name) as string | undefined,
          logo: (cp?.logoUrl || cp?.logo || cp?.logo_url || cp?.avatar || user.avatar) as string | undefined,
        }
      : undefined

    return {
    title: { ar: form.title_ar.trim(), en: form.title_en.trim(), de: form.title_de.trim() },
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
    description: { ar: form.description_ar.trim(), en: form.description_en.trim(), de: form.description_de.trim() },
    responsibilities: { ar: form.responsibilities_ar.trim(), en: form.responsibilities_en.trim(), de: form.responsibilities_de.trim() },
    requirements: { ar: form.requirements_ar.trim(), en: form.requirements_en.trim(), de: form.requirements_de.trim() },
    image: imageFile!,
    company,
  }
  }

  // Include current company info from session (if available) so the backend
  // can show the company profile/logo on job details without extra lookups.
  

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
        const res = await fetch("/api/company/jobs", {
          method: "POST",
          body: formData,
          headers: {
            "x-locale": locale,
            "Accept-Language": locale,
          },
        })
        const result = (await res.json()) as { ok: boolean; message?: string }
        if (!res.ok || !result.ok) {
          setError(result.message ?? t("loadError"))
          return
        }
        router.push("/dashboard/company/jobs")
      } catch (err) {
        console.error(err)
        setError(t("loadError"))
      }
    })
  }

  const stepLabels: [string, string, string] = [
    t("steps.basic"),
    t("steps.info"),
    t("steps.description"),
  ]

  return (
    /* تم مسح الاختصار max-w-[920px] هنا وأصبحت w-full ممتدة بالكامل دون أي قيود */
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "relative flex w-full flex-col items-stretch gap-4 rounded-lg bg-white p-4 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:gap-5 sm:p-6",
        pending && "pointer-events-none opacity-80"
      )}
    >
      <div className="w-full flex flex-col gap-2">
        <div className="flex flex-col items-center gap-3 w-full sm:flex-row sm:justify-between px-8 sm:px-0">
          <h1 className={cn(
            "bg-clip-text text-[24px] font-bold leading-[1.3] text-transparent sm:text-[32px] py-1 text-center sm:text-start flex-1",
            isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l",
            "from-[#032C44] to-[#41A0CA]"
          )}>
            {t("title")}
          </h1>
          {/* Language switcher — shown on all steps for consistency */}
          <div className="flex gap-1.5 justify-center sm:justify-start shrink-0">
            {(["ar", "en", "de"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setEditingLocale(l)}
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
            href="/dashboard/company/jobs"
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
            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center gap-0.5 text-start">
                <span className="text-base font-medium leading-[150%] text-[#262626]">
                  {t("fields.title")}
                </span>
                <span className="text-base font-medium leading-[150%] text-[#FF2D55]">*</span>
              </div>

              <JobUnderlineInput
                value={(form as any)[`title_${editingLocale}`]}
                onChange={(v) => set((`title_${editingLocale}` as unknown) as keyof FormState, v)}
                placeholder={t("placeholders.title")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <JobFieldGroup label={t("fields.category")} required>
                <JobUnderlineSelect
                  value={form.category_id}
                  onChange={(v) => {
                    set("category_id", v)
                    set("sub_category_id", "")
                  }}
                  placeholder={t("placeholders.select")}
                  options={categoryOptions}
                  disabled={categoryOptions.length === 0}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.subCategory")} required>
                <JobUnderlineSelect
                  value={form.sub_category_id}
                  onChange={(v) => set("sub_category_id", v)}
                  placeholder={t("placeholders.select")}
                  disabled={!form.category_id || pending}
                  options={
                    subCategories.length > 0
                      ? subCategories.map((s) => ({
                          value: String(s.id),
                          label: s.name,
                        }))
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
                  onChange={(v) => set("state", v)}
                  placeholder={t("placeholders.select")}
                  options={stateOptions}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.vacancy")} required>
                <JobUnderlineInput
                  type="number"
                  min={1}
                  value={form.vacancy}
                  onChange={(v) => set("vacancy", v)}
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
                  onChange={(v) => set("gender", v)}
                  placeholder={t("placeholders.select")}
                  options={genderOptions}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.employmentType")} required>
                <JobUnderlineSelect
                  value={form.employment_type}
                  onChange={(v) => set("employment_type", v)}
                  placeholder={t("placeholders.select")}
                  options={jobTypeOptions}
                />
              </JobFieldGroup>
            </div>

            <JobFieldGroup label={t("fields.deadline")} required>
              <JobUnderlineDate
                value={form.application_deadline}
                onChange={(v) => set("application_deadline", v)}
              />
            </JobFieldGroup>

            <JobFieldGroup label={t("fields.salary")} required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <JobUnderlineInput
                  type="number"
                  min={0}
                  value={form.salary_from}
                  onChange={(v) => set("salary_from", v)}
                  placeholder={t("placeholders.salaryFrom")}
                />
                <JobUnderlineInput
                  type="number"
                  min={0}
                  value={form.salary_to}
                  onChange={(v) => set("salary_to", v)}
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
                  onChange={(v) => set("age_from", v)}
                  placeholder={t("placeholders.ageFrom")}
                />
                <JobUnderlineInput
                  type="number"
                  min={18}
                  value={form.age_to}
                  onChange={(v) => set("age_to", v)}
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
                value={(form as any)[`description_${editingLocale}`]}
                onChange={(v) => set((`description_${editingLocale}` as unknown) as keyof FormState, v)}
                rows={4}
              />
            </JobFieldGroup>
            <JobFieldGroup label={t("fields.responsibilities")} required>
              <JobUnderlineTextarea
                value={(form as any)[`responsibilities_${editingLocale}`]}
                onChange={(v) => set((`responsibilities_${editingLocale}` as unknown) as keyof FormState, v)}
                rows={4}
              />
            </JobFieldGroup>
            <JobFieldGroup label={t("fields.requirements")} required>
              <JobUnderlineTextarea
                value={(form as any)[`requirements_${editingLocale}`]}
                onChange={(v) => set((`requirements_${editingLocale}` as unknown) as keyof FormState, v)}
                rows={4}
              />
            </JobFieldGroup>
          </>
        )}

        {categoryOptions.length === 0 ? (
          <p className="text-center text-sm text-[#FF2D55]" role="status">
            {t("errors.categoriesUnavailable")}
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
          <GradientOutlineButton onClick={() => router.push("/dashboard/company/jobs") }>
            {t("cancel")}
          </GradientOutlineButton>
        ) : (
          <GradientOutlineButton onClick={() => setStep(step - 1)}>{t("back")}</GradientOutlineButton>
        )}

        {step < 3 ? (
          <PrimaryButton
            type="button"
            onClick={handleNext}
            disabled={pending || categoryOptions.length === 0}
            className="h-9 min-w-[120px] w-auto rounded-lg px-4 text-base font-normal"
          >
            {t("next")}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            type="button"
            onClick={handleSubmit}
            disabled={pending || categoryOptions.length === 0}
            className="h-9 min-w-[120px] w-auto rounded-lg px-4 text-base font-normal"
          >
            {pending ? t("submitting") : t("submit")}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}