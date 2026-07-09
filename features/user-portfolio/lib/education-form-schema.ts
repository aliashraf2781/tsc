import { z } from "zod"

export type EducationFormMessages = {
  universityRequired: string
  specializationRequired: string
  graduationYearRequired: string
  levelRequired: string
  gradeRequired: string
}

export function createEducationFormSchema(messages: EducationFormMessages) {
  return z.object({
    university: z.string().trim().min(1, messages.universityRequired),
    levelOfEducation: z.enum(["high_school", "bachelor", "master", "phd"], {
      message: messages.levelRequired,
    }),
    graduationYear: z.string().trim().min(1, messages.graduationYearRequired),
    specialization: z.string().trim().min(1, messages.specializationRequired),
    finalGrade: z.enum(["excellent", "very_good", "good", "pass"], {
      message: messages.gradeRequired,
    }),
    attachment: z.string().nullable().optional(),
    attachmentFile: z.instanceof(File).nullable().optional(),
  })
}

export type EducationFormValues = z.infer<ReturnType<typeof createEducationFormSchema>>
