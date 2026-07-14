import { z } from "zod"

export const LOCALES = ["ar", "en", "de"] as const
export type LocaleKey = (typeof LOCALES)[number]

const localizedTextSchema = z.object({
  ar: z.string(),
  en: z.string(),
  de: z.string(),
})

export type LocalizedText = z.infer<typeof localizedTextSchema>

export type FaqFormMessages = {
  questionRequired: string
}

export function createFaqFormSchema(messages: FaqFormMessages) {
  return z.object({
    question: localizedTextSchema.refine((value) => Boolean(value.ar.trim() || value.en.trim() || value.de.trim()), {
      message: messages.questionRequired,
    }),
    answer: localizedTextSchema,
  })
}

export type FaqFormValues = z.infer<ReturnType<typeof createFaqFormSchema>>
