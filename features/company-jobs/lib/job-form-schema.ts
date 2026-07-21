import { z } from "zod"

export const LOCALES = ["ar", "en", "de"] as const
export type LocaleKey = (typeof LOCALES)[number]

// Arabic is filled automatically from whichever tab was actually typed in
// (see fillLocaleFallback), so it is not exposed as an editable tab here —
// mirrors the categories admin panel.
export const EDIT_LOCALES: LocaleKey[] = ["en", "de"]

const localizedTextSchema = z.object({
  ar: z.string(),
  en: z.string(),
  de: z.string(),
})

export type LocalizedText = z.infer<typeof localizedTextSchema>

export type JobFormMessages = {
  title: string
  category: string
  state: string
  vacancy: string
  gender: string
  employmentType: string
  deadline: string
  salary: string
  salaryRange: string
  age: string
  ageRange: string
  description: string
  responsibilities: string
  requirements: string
  company?: string
}

export function createJobFormSchema(messages: JobFormMessages, opts: { requireCompany: boolean }) {
  return z
    .object({
      companyId: z.string(),
      title: localizedTextSchema,
      category_id: z.string().min(1, messages.category),
      sub_category_id: z.string(),
      state: z.string().min(1, messages.state),
      vacancy: z.string().min(1, messages.vacancy),
      gender: z.string().min(1, messages.gender),
      employment_type: z.string().min(1, messages.employmentType),
      application_deadline: z.string().min(1, messages.deadline),
      salary_from: z.string().min(1, messages.salary),
      salary_to: z.string().min(1, messages.salary),
      age_from: z.string().min(1, messages.age),
      age_to: z.string().min(1, messages.age),
      description: localizedTextSchema,
      responsibilities: localizedTextSchema,
      requirements: localizedTextSchema,
    })
    .superRefine((values, ctx) => {
      if (opts.requireCompany && !values.companyId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyId"],
          message: messages.company ?? messages.category,
        })
      }
      if (!hasAnyLocalizedValue(values.title)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["title", "en"], message: messages.title })
      }
      if (Number(values.vacancy) < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["vacancy"], message: messages.vacancy })
      }
      if (Number(values.salary_from) > Number(values.salary_to)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["salary_to"], message: messages.salaryRange })
      }
      if (Number(values.age_from) > Number(values.age_to)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["age_to"], message: messages.ageRange })
      }
      if (!hasAnyLocalizedValue(values.description)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["description", "en"], message: messages.description })
      }
      if (!hasAnyLocalizedValue(values.responsibilities)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["responsibilities", "en"], message: messages.responsibilities })
      }
      if (!hasAnyLocalizedValue(values.requirements)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["requirements", "en"], message: messages.requirements })
      }
    })
}

export type JobFormValues = z.infer<ReturnType<typeof createJobFormSchema>>

function hasRichTextContent(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0
}

function hasAnyLocalizedValue(text: LocalizedText): boolean {
  return Object.values(text).some((value) => hasRichTextContent(value))
}
