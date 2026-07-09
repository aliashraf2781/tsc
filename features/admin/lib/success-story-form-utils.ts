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
 * Builds RHF default values from a success story record fetched for
 * editing.
 *
 * Unlike FAQs/News, the admin API only exposes a single-locale normalized
 * story (see `getAdminSuccessStory`), so only the requested locale's tab can
 * be pre-filled — the other language tabs start empty rather than
 * duplicating the same text across all three.
 */
export function mapStoryToFormDefaults(story: any, locale: string): SuccessStoryFormValues {
  const name = emptyLocalizedText()
  const role = emptyLocalizedText()
  const location = emptyLocalizedText()
  const quote = emptyLocalizedText()

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
