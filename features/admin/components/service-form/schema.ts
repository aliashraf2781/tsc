import { z } from "zod"

const localizedText = z.object({
  ar: z.string(),
  en: z.string(),
  de: z.string(),
})

const requiredLocalizedText = localizedText.refine((v) => v.ar.trim().length > 0, {
  message: "required",
  path: ["ar"],
})

const featureSchema = z.object({
  id: z.number().optional(),
  title: localizedText,
  description: localizedText,
  icon: z.string(),
  iconFile: z.any().nullable().optional(),
  iconPreview: z.string().nullable().optional(),
})

export const serviceFormSchema = z.object({
  title: requiredLocalizedText,
  description: requiredLocalizedText,
  features: z.array(featureSchema),
  imageFile: z.any().nullable().optional(),
  imagePreview: z.string().nullable().optional(),
  existingImage: z.string().optional(),
})
