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

export const STEP_FIELDS: Record<number, (keyof JobFormValues)[]> = {
  1: ["companyId", "title", "category_id", "sub_category_id", "state", "vacancy"],
  2: ["gender", "employment_type", "application_deadline", "salary_from", "salary_to", "age_from", "age_to"],
  3: ["description", "responsibilities", "requirements"],
}

export type EditingLocale = LocaleKey
