import { z } from "zod"

export type ContactFormMessages = {
  nameRequired: string
  emailRequired: string
  emailInvalid: string
  subjectRequired: string
  messageRequired: string
  phoneInvalid: string
  countryRequired: string
}

export function createContactFormSchema(messages: ContactFormMessages) {
  return z
    .object({
      name: z.string().trim().min(1, messages.nameRequired),
      email: z
        .string()
        .trim()
        .min(1, messages.emailRequired)
        .refine((value) => z.email().safeParse(value).success, {
          message: messages.emailInvalid,
        }),
      countryCode: z.string().trim().optional(),
      phone: z
        .string()
        .trim()
        .regex(/^[\d\s-]*$/, messages.phoneInvalid)
        .optional(),
      subject: z.string().trim().min(1, messages.subjectRequired),
      message: z.string().trim().min(1, messages.messageRequired),
    })
    .refine((data) => !data.phone || data.countryCode, {
      message: messages.countryRequired,
      path: ["countryCode"],
    })
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactFormSchema>>
