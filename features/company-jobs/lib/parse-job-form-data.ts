import type { CreateJobPayload, LocalizedText } from "@/lib/api/services/company.service"

const LOCALES = ["ar", "en", "de"] as const

function readLocalized(formData: FormData, key: string): LocalizedText {
  const out = { ar: "", en: "", de: "" }
  for (const locale of LOCALES) {
    const value = formData.get(`${key}[${locale}]`)
    if (typeof value === "string") out[locale] = value
  }
  return out
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function readNumber(formData: FormData, key: string): number {
  const raw = readString(formData, key)
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function readOptionalString(formData: FormData, key: string): string | undefined {
  const v = formData.get(key)
  return typeof v === "string" && v.trim() ? v : undefined
}

export function parseJobFormData(formData: FormData): CreateJobPayload | null {
  const imageEntry = formData.get("image")
  if (!(imageEntry instanceof File) || imageEntry.size === 0) return null

  const gender = readString(formData, "gender") as CreateJobPayload["gender"]
  if (gender !== "Male" && gender !== "Female" && gender !== "All") return null

  // Read employment type and accept known values; default to full_time when missing/invalid
  const rawEmployment = readString(formData, "employment_type")
  const employment_type: CreateJobPayload["employment_type"] =
    rawEmployment === "full_time" || rawEmployment === "part_time" ? (rawEmployment as CreateJobPayload["employment_type"]) : "full_time"

  return {
    title: readLocalized(formData, "title"),
    category_id: readNumber(formData, "category_id"),
    sub_category_id: readNumber(formData, "sub_category_id"),
    state: readString(formData, "state"),
    vacancy: readNumber(formData, "vacancy"),
    gender,
    application_deadline: readString(formData, "application_deadline"),
    salary_from: readNumber(formData, "salary_from"),
    salary_to: readNumber(formData, "salary_to"),
    age_from: readNumber(formData, "age_from"),
    age_to: readNumber(formData, "age_to"),
    description: readLocalized(formData, "description"),
    responsibilities: readLocalized(formData, "responsibilities"),
    requirements: readLocalized(formData, "requirements"),
    employment_type,
    image: imageEntry,
    // Optional embedded company info
    company: (function () {
      const id = readNumber(formData, "company[id]")
      const name = readOptionalString(formData, "company[name]")
      const logo = readOptionalString(formData, "company[logo]")
      if (id || name || logo) return { id: id || undefined, name, logo }
      return undefined
    })(),
  }
}
