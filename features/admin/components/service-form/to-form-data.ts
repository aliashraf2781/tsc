import { LOCALES } from "./types"
import type { ServiceFormValues } from "./types"

export function serviceFormToFormData(form: ServiceFormValues, id?: number): FormData {
  const formData = new FormData()
  if (id) formData.append("id", String(id))

  for (const lang of LOCALES) {
    const t = form.title[lang]?.trim()
    const d = form.description[lang]?.trim()
    if (t) formData.append(`title[${lang}]`, t)
    if (d) formData.append(`description[${lang}]`, d)
  }

  if (form.imageFile) formData.append("image", form.imageFile)

  form.features.forEach((feat, fi) => {
    if (feat.id) formData.append(`features[${fi}][id]`, String(feat.id))
    for (const lang of LOCALES) {
      const t = feat.title[lang]?.trim()
      const d = feat.description[lang]?.trim()
      if (t) formData.append(`features[${fi}][title][${lang}]`, t)
      if (d) formData.append(`features[${fi}][description][${lang}]`, d)
    }
    // Only send an uploaded file for icon under the expected key; avoid sending plain strings for validation
    if (feat.iconFile) formData.append(`features[${fi}][icon]`, feat.iconFile)
  })

  return formData
}
