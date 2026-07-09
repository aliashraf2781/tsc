import { z } from "zod"

export type ExperienceFormMessages = {
  companyRequired: string
  departmentRequired: string
  startDateRequired: string
  endDateRequired: string
  responsibilitiesRequired: string
}

export function createExperienceFormSchema(messages: ExperienceFormMessages) {
  return z
    .object({
      companyName: z.string().trim().min(1, messages.companyRequired),
      department: z.string().trim().min(1, messages.departmentRequired),
      startDate: z.string().trim().min(1, messages.startDateRequired),
      endDate: z.string().trim().optional(),
      currentlyWorking: z.boolean(),
      responsibilities: z.string().trim().min(1, messages.responsibilitiesRequired),
      attachment: z.string().nullable().optional(),
      attachmentFile: z.instanceof(File).nullable().optional(),
    })
    .refine((data) => data.currentlyWorking || !!data.endDate, {
      message: messages.endDateRequired,
      path: ["endDate"],
    })
}

export type ExperienceFormValues = z.infer<ReturnType<typeof createExperienceFormSchema>>
