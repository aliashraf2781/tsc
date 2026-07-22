import type { Job } from "@/lib/api/types"
import {
  resolveJobAge,
  resolveJobApplicationDeadline,
  resolveJobSalaryRange,
  resolveJobSubCategoryId,
} from "@/features/jobs/lib/job-display"
import { LOCALES, type JobFormValues, type LocaleKey, type LocalizedText } from "./job-form-schema"

export function emptyLocalizedText(): LocalizedText {
  return { ar: "", en: "", de: "" }
}

export const initialJobFormValues: JobFormValues = {
  companyId: "",
  title: emptyLocalizedText(),
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
  description: emptyLocalizedText(),
  responsibilities: emptyLocalizedText(),
  requirements: emptyLocalizedText(),
}

function localizedContent(value: string | undefined): string {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
}

// Backend requires title[ar]/[en]/[de] (and similar) all present; fill
// untranslated locales with whichever locale the user actually typed —
// only en/de are editable via the UI tabs, ar rides along as a fallback copy.
export function fillLocaleFallback(text: LocalizedText): LocalizedText {
  const fallback =
    LOCALES.map((l) => text[l]).find((value) => localizedContent(value).length > 0) || ""
  return {
    ar: localizedContent(text.ar) ? text.ar : fallback,
    en: localizedContent(text.en) ? text.en : fallback,
    de: localizedContent(text.de) ? text.de : fallback,
  }
}

function localizedTextFromJobField(value: string | Record<string, string> | undefined): LocalizedText {
  if (!value) return emptyLocalizedText()
  if (typeof value === "string") return { ar: value, en: value, de: value }
  return { ar: value.ar ?? "", en: value.en ?? "", de: value.de ?? "" }
}

function toDateInputValue(value: string | undefined): string {
  if (!value) return ""
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10)
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10)
}

/** Prefill the wizard's form state from an existing job (edit mode). */
export function jobToFormValues(job: Job): JobFormValues {
  // The API sends salary/age/deadline in different shapes depending on the
  // endpoint (nested `salary.from/to`, `age.from/to`, camelCase, etc.) —
  // reuse the same resolvers the read-only job views rely on instead of
  // reading the flat field names directly, or these come back empty.
  const { from: salaryFrom, to: salaryTo } = resolveJobSalaryRange(job)
  const { from: ageFrom, to: ageTo } = resolveJobAge(job)
  const deadline = resolveJobApplicationDeadline(job)
  const subCategoryId = resolveJobSubCategoryId(job)

  return {
    companyId: job.company?.id != null ? String(job.company.id) : "",
    title: localizedTextFromJobField(job.title),
    category_id: job.category?.id != null ? String(job.category.id) : "",
    sub_category_id: subCategoryId != null ? String(subCategoryId) : "",
    state: job.state ?? "",
    vacancy: job.vacancy != null ? String(job.vacancy) : "",
    gender: job.gender ?? "",
    employment_type: job.employment_type ?? job.job_type ?? "",
    application_deadline: toDateInputValue(deadline),
    salary_from: salaryFrom != null ? String(salaryFrom) : "",
    salary_to: salaryTo != null ? String(salaryTo) : "",
    age_from: ageFrom != null ? String(ageFrom) : "",
    age_to: ageTo != null ? String(ageTo) : "",
    description: localizedTextFromJobField(job.description),
    responsibilities: localizedTextFromJobField(job.responsibilities),
    requirements: localizedTextFromJobField(job.requirements),
  }
}

export const STEP_FIELDS: Record<number, (keyof JobFormValues)[]> = {
  1: ["companyId", "title", "category_id", "sub_category_id", "state", "vacancy"],
  2: ["gender", "employment_type", "application_deadline", "salary_from", "salary_to", "age_from", "age_to"],
  3: ["description", "responsibilities", "requirements"],
}

export type EditingLocale = LocaleKey
