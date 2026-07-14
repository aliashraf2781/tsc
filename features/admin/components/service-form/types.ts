export const LOCALES = ["ar", "en", "de"] as const
export type LocaleKey = (typeof LOCALES)[number]
export type LocalizedText = Record<LocaleKey, string>

export type FeatureFormValues = {
  id?: number
  title: LocalizedText
  description: LocalizedText
  icon: string
  iconFile?: File | null
  iconPreview?: string | null
}

export type ServiceFormValues = {
  title: LocalizedText
  description: LocalizedText
  features: FeatureFormValues[]
  imageFile?: File | null
  imagePreview?: string | null
  existingImage?: string
}

export function emptyLocalizedText(): LocalizedText {
  return { ar: "", en: "", de: "" }
}

export function emptyFeature(): FeatureFormValues {
  return { title: emptyLocalizedText(), description: emptyLocalizedText(), icon: "" }
}

export function emptyServiceForm(): ServiceFormValues {
  return { title: emptyLocalizedText(), description: emptyLocalizedText(), features: [emptyFeature()] }
}
