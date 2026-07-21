import { type LocaleKey, type LocalizedText, type SuccessStoryFormValues } from "./success-story-form-schema"
import { LOCALES } from "./success-story-form-schema"

export function emptyLocalizedText(): LocalizedText {
  return { ar: "", en: "", de: "" }
}

export function initialSuccessStoryFormValues(): SuccessStoryFormValues {
  return {
    name: emptyLocalizedText(),
    role: emptyLocalizedText(),
    location: emptyLocalizedText(),
    quote: emptyLocalizedText(),
    imageFile: null,
    imagePreview: null,
    existingImage: "",
  }
}

export function buildSuccessStoryFormData(values: SuccessStoryFormValues, id?: number): FormData {
  const formData = new FormData()
  if (id) formData.append("id", String(id))

  for (const lang of LOCALES) {
    const name = values.name[lang]?.trim()
    const role = values.role[lang]?.trim()
    const location = values.location[lang]?.trim()
    const quote = values.quote[lang]?.trim()
    if (name) formData.append(`name[${lang}]`, name)
    if (role) formData.append(`role[${lang}]`, role)
    if (location) formData.append(`location[${lang}]`, location)
    if (quote) formData.append(`quote[${lang}]`, quote)
  }

  if (values.imageFile) formData.append("image", values.imageFile)

  return formData
}

/**
 * Builds RHF default values from a success story record fetched for editing.
 *
 * The edit page fetches the ar/en/de story separately and stitches them under
 * `story.__allLocales` so every language tab can be pre-filled.
 */
export function mapStoryToFormDefaults(story: any, locale: string): SuccessStoryFormValues {
  const name = emptyLocalizedText()
  const role = emptyLocalizedText()
  const location = emptyLocalizedText()
  const quote = emptyLocalizedText()

  const allLocales = story?.__allLocales as Record<string, any> | undefined

  if (allLocales) {
    for (const loc of LOCALES) {
      const item = allLocales[loc] ?? {}
      name[loc] = item.name ?? ""
      role[loc] = item.role ?? ""
      location[loc] = item.location ?? ""
      quote[loc] = item.quote ?? ""
    }

    const existingImage =
      allLocales[locale as LocaleKey]?.image_url ??
      allLocales[locale as LocaleKey]?.image ??
      allLocales.ar?.image_url ??
      allLocales.ar?.image ??
      allLocales.en?.image_url ??
      allLocales.en?.image ??
      allLocales.de?.image_url ??
      allLocales.de?.image ??
      ""

    return {
      name,
      role,
      location,
      quote,
      imageFile: null,
      imagePreview: null,
      existingImage,
    }
  }

  const loc = (locale as LocaleKey) in name ? (locale as LocaleKey) : "ar"
  name[loc] = story?.name ?? ""
  role[loc] = story?.role ?? ""
  location[loc] = story?.location ?? ""
  quote[loc] = story?.quote ?? ""

  return {
    name,
    role,
    location,
    quote,
    imageFile: null,
    imagePreview: null,
    existingImage: story?.image_url ?? story?.image ?? "",
  }
}
