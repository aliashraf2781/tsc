import type { CreateJobPayload } from "@/lib/api/services/company.service"

const LOCALES = ["ar", "en", "de"] as const

function appendLocalized(
  formData: FormData,
  key: string,
  values: { ar: string; en: string; de: string }
) {
  for (const locale of LOCALES) {
    const value = values[locale]?.trim()
    if (value) formData.append(`${key}[${locale}]`, value)
  }
}

function appendJobFields(
  formData: FormData,
  payload: Omit<CreateJobPayload, "image">
) {
  appendLocalized(formData, "title", payload.title)
  formData.append("category_id", String(payload.category_id))
  formData.append("sub_category_id", String(payload.sub_category_id))
  formData.append("state", payload.state)
  formData.append("vacancy", String(payload.vacancy))
  formData.append("gender", payload.gender)
  formData.append("employment_type", payload.employment_type)
  formData.append("job_type", payload.employment_type)
  formData.append("application_deadline", payload.application_deadline)
  formData.append("salary_from", String(payload.salary_from))
  formData.append("salary_to", String(payload.salary_to))
  formData.append("age_from", String(payload.age_from))
  formData.append("age_to", String(payload.age_to))
  appendLocalized(formData, "description", payload.description)
  appendLocalized(formData, "responsibilities", payload.responsibilities)
  appendLocalized(formData, "requirements", payload.requirements)
  // Append optional company info if present
  const company = (payload as any).company
  if (company) {
    if (typeof company.id === "number") formData.append("company[id]", String(company.id))
    if (typeof company.name === "string" && company.name.trim()) formData.append("company[name]", company.name.trim())
    if (typeof company.logo === "string" && company.logo.trim()) formData.append("company[logo]", company.logo.trim())
  }
}

export function buildJobFormData(payload: CreateJobPayload): FormData {
  const formData = new FormData()
  appendJobFields(formData, payload)
  formData.append(
    "image",
    payload.image,
    payload.image instanceof File ? payload.image.name : "job-image.jpg"
  )
  return formData
}

export function buildJobFormDataForUpdate(
  payload: Omit<CreateJobPayload, "image"> & { image?: File | Blob | null }
): FormData {
  const formData = new FormData()
  appendJobFields(formData, payload)
  // Also append company info for updates if present
  const company = (payload as any).company
  if (company) {
    if (typeof company.id === "number") formData.append("company[id]", String(company.id))
    if (typeof company.name === "string" && company.name.trim()) formData.append("company[name]", company.name.trim())
    if (typeof company.logo === "string" && company.logo.trim()) formData.append("company[logo]", company.logo.trim())
  }
  if (payload.image) {
    formData.append(
      "image",
      payload.image,
      payload.image instanceof File ? payload.image.name : "job-image.jpg"
    )
  }
  return formData
}

/** Duplicate a single string into ar/en/de for quick single-locale forms */
export function toLocalizedText(value: string): { ar: string; en: string; de: string } {
  const v = value.trim()
  return { ar: v, en: v, de: v }
}
