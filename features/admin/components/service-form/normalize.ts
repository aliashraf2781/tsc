import { LOCALES, LocaleKey, LocalizedText, ServiceFormValues, emptyLocalizedText } from "./types"

function parseLocalizedField(value: unknown, locale: LocaleKey): LocalizedText {
  const out = emptyLocalizedText()
  if (!value) return out

  if (typeof value === "string") {
    // treat plain string as content for the current locale only
    out[locale] = value
    return out
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (typeof obj.ar === "string" || typeof obj.en === "string" || typeof obj.de === "string") {
      out.ar = typeof obj.ar === "string" ? obj.ar : ""
      out.en = typeof obj.en === "string" ? obj.en : ""
      out.de = typeof obj.de === "string" ? obj.de : ""
      return out
    }

    // try keys with suffixes like title_ar, description_en, etc.
    for (const k of Object.keys(obj)) {
      const m = k.match(/_?(ar|en|de)$/)
      if (m) {
        const l = m[1] as LocaleKey
        const v = obj[k]
        if (typeof v === "string") out[l] = v
      }
    }

    return out
  }

  return out
}

/**
 * Builds form defaults from a service that carries a `__allLocales` map
 * (one raw service object per locale, as fetched by the edit page so admins
 * can edit every translation at once). Falls back to a single-locale shape
 * when `__allLocales` isn't present.
 */
export function normalizeServiceToFormValues(service: any, locale: string): ServiceFormValues {
  const allLocales = service?.__allLocales as Record<string, any> | undefined

  if (allLocales) {
    const title = emptyLocalizedText()
    const description = emptyLocalizedText()

    for (const loc of LOCALES) {
      const item = allLocales[loc] ?? {}
      title[loc] = parseLocalizedField(item.title ?? item.title_raw ?? item, loc)[loc] || ""
      description[loc] = parseLocalizedField(item.description ?? item.content ?? item, loc)[loc] || ""
    }

    const featuresByLocale: Record<string, any[]> = {}
    for (const loc of LOCALES) {
      featuresByLocale[loc] = Array.isArray(allLocales[loc]?.features) ? allLocales[loc].features : []
    }

    const idSet = new Set<number>()
    for (const loc of LOCALES) {
      for (const f of featuresByLocale[loc]) {
        if (f && typeof f.id === "number") idSet.add(f.id)
      }
    }

    const features: ServiceFormValues["features"] = []
    if (idSet.size > 0) {
      for (const idVal of Array.from(idSet)) {
        const fTitle = emptyLocalizedText()
        const fDesc = emptyLocalizedText()
        let icon = ""
        for (const loc of LOCALES) {
          const f = featuresByLocale[loc].find((ff) => ff && ff.id === idVal)
          fTitle[loc] = parseLocalizedField(f?.title ?? f?.title_raw ?? f, loc)[loc] || ""
          fDesc[loc] = parseLocalizedField(f?.description ?? f?.content ?? f, loc)[loc] || ""
          if (!icon && f?.icon) icon = f.icon
        }
        features.push({ id: idVal, title: fTitle, description: fDesc, icon })
      }
    } else {
      const maxLen = Math.max(0, ...LOCALES.map((l) => featuresByLocale[l].length))
      for (let i = 0; i < maxLen; i++) {
        const fTitle = emptyLocalizedText()
        const fDesc = emptyLocalizedText()
        let icon = ""
        for (const loc of LOCALES) {
          const f = featuresByLocale[loc][i]
          fTitle[loc] = parseLocalizedField(f?.title ?? f?.title_raw ?? f, loc)[loc] || ""
          fDesc[loc] = parseLocalizedField(f?.description ?? f?.content ?? f, loc)[loc] || ""
          if (!icon && f?.icon) icon = f.icon
        }
        features.push({ title: fTitle, description: fDesc, icon })
      }
    }

    const existingImage =
      allLocales[locale as LocaleKey]?.image ?? allLocales.ar?.image ?? allLocales.en?.image ?? allLocales.de?.image ?? ""

    return { title, description, existingImage, features }
  }

  // Fallback: single-locale shaped service
  const title = parseLocalizedField(service?.title ?? service?.title_raw ?? service, locale as LocaleKey)
  const description = parseLocalizedField(service?.description ?? service?.content ?? service, locale as LocaleKey)

  const features = Array.isArray(service?.features)
    ? service.features.map((f: any) => ({
        id: f.id,
        title: parseLocalizedField(f.title ?? f.title_raw ?? f, locale as LocaleKey),
        description: parseLocalizedField(f.description ?? f.content ?? f, locale as LocaleKey),
        icon: f.icon ?? "",
      }))
    : []

  return {
    title,
    description,
    existingImage: service?.image ?? "",
    features,
  }
}
