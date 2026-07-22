import { z } from "zod"
import type { LocalizedName } from "./category-form-schema"

export { LOCALES, EDIT_LOCALES, type LocaleKey, type LocalizedName } from "./category-form-schema"

export type CountryFormMessages = {
  nameRequired: string
  codeRequired: string
}

export function createCountryFormSchema(messages: CountryFormMessages) {
  return z.object({
    name: z
      .object({
        ar: z.string(),
        en: z.string(),
        de: z.string(),
      })
      .refine((value) => Boolean(value.ar.trim() || value.en.trim() || value.de.trim()), {
        message: messages.nameRequired,
      }),
    code: z.string().trim().min(1, { message: messages.codeRequired }),
  })
}

export type CountryFormValues = z.infer<ReturnType<typeof createCountryFormSchema>>

export type AdminCountry = {
  id: number
  name: LocalizedName
  code: string
}
