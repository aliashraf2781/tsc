import { z } from "zod"

export const LOCALES = ["ar", "en", "de"] as const
export type LocaleKey = (typeof LOCALES)[number]

// Arabic is filled automatically from whichever tab the admin actually
// typed in (see fillLocaleFallback), so it is not exposed as a tab here.
export const EDIT_LOCALES: LocaleKey[] = ["en", "de"]

const localizedNameSchema = z.object({
  ar: z.string(),
  en: z.string(),
  de: z.string(),
})

export type LocalizedName = z.infer<typeof localizedNameSchema>

export type CategoryFormMessages = {
  nameRequired: string
}

export function createCategoryFormSchema(messages: CategoryFormMessages) {
  return z.object({
    name: localizedNameSchema.refine(
      (value) => Boolean(value.ar.trim() || value.en.trim() || value.de.trim()),
      { message: messages.nameRequired }
    ),
    subCategories: z.array(
      z.object({
        subCategoryId: z.number().optional(),
        name: localizedNameSchema,
      })
    ),
  })
}

export type CategoryFormValues = z.infer<ReturnType<typeof createCategoryFormSchema>>
