import { z } from "zod"

export type LanguageFormMessages = {
  languageRequired: string
  atLeastOne: string
}

export function createLanguageFormSchema(messages: LanguageFormMessages) {
  return z.object({
    rows: z
      .array(
        z.object({
          id: z.number().optional(),
          tempId: z.string().optional(),
          language: z.string().trim().min(1, messages.languageRequired),
          level: z.enum(["beginner", "intermediate", "fluent", "native"]),
        })
      )
      .min(1, messages.atLeastOne),
  })
}

export type LanguageFormValues = z.infer<ReturnType<typeof createLanguageFormSchema>>
export type LanguageRowValues = LanguageFormValues["rows"][number]
