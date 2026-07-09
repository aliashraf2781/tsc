import { z } from "zod"

export type SkillsFormMessages = {
  atLeastOne: string
}

export function createSkillsFormSchema(messages: SkillsFormMessages) {
  return z.object({
    skills: z
      .array(
        z.object({
          id: z.number().optional(),
          tempId: z.string().optional(),
          skillName: z.string().trim().min(1),
        })
      )
      .min(1, messages.atLeastOne),
  })
}

export type SkillsFormValues = z.infer<ReturnType<typeof createSkillsFormSchema>>
