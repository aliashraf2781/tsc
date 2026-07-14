import { z } from "zod"

export const LOCALES = ["ar", "en", "de"] as const
export type LocaleKey = (typeof LOCALES)[number]

const localizedTextSchema = z.object({
  ar: z.string(),
  en: z.string(),
  de: z.string(),
})

export type LocalizedText = z.infer<typeof localizedTextSchema>

export type SuccessStoryFormMessages = {
  nameRequired: string
  locationRequired: string
}

export function createSuccessStoryFormSchema(messages: SuccessStoryFormMessages) {
  return z.object({
    name: localizedTextSchema.refine((value) => Boolean(value.ar.trim() || value.en.trim() || value.de.trim()), {
      message: messages.nameRequired,
    }),
    role: localizedTextSchema,
    location: localizedTextSchema.refine((value) => Boolean(value.ar.trim() || value.en.trim() || value.de.trim()), {
      message: messages.locationRequired,
    }),
    quote: localizedTextSchema,
    imageFile: z.custom<File | null | undefined>().optional(),
    imagePreview: z.string().nullable().optional(),
    existingImage: z.string().optional(),
  })
}

export type SuccessStoryFormValues = z.infer<ReturnType<typeof createSuccessStoryFormSchema>>
