import { z } from "zod"

export const LOCALES = ["ar", "en", "de"] as const
export type LocaleKey = (typeof LOCALES)[number]

const localizedTextSchema = z.object({
  ar: z.string(),
  en: z.string(),
  de: z.string(),
})

export type LocalizedText = z.infer<typeof localizedTextSchema>

export type NewsFormMessages = {
  titleRequired: string
}

export function createNewsFormSchema(messages: NewsFormMessages) {
  return z.object({
    title: localizedTextSchema.refine((value) => Boolean(value.ar.trim() || value.en.trim() || value.de.trim()), {
      message: messages.titleRequired,
    }),
    description: localizedTextSchema,
    imageFile: z.custom<File | null | undefined>().optional(),
    imagePreview: z.string().nullable().optional(),
    existingImage: z.string().optional(),
  })
}

export type NewsFormValues = z.infer<ReturnType<typeof createNewsFormSchema>>
