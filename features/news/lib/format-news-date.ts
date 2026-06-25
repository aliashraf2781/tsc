const LOCALE_MAP: Record<string, string> = {
  ar: "ar-EG",
  en: "en-GB",
  de: "de-DE",
}

export function formatNewsDate(dateStr: string, locale: string, fallback = ""): string {
  if (!dateStr) return fallback

  try {
    const intlLocale = LOCALE_MAP[locale] ?? locale
    return new Intl.DateTimeFormat(intlLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr))
  } catch (err) {
    console.warn(err)
    return fallback || dateStr
  }
}
