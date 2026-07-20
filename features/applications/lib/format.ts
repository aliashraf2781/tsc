import type { AppLocale } from "./types"

const DATE_TIME_LOCALES: Record<AppLocale, string> = {
  ar: "ar-EG",
  en: "en-GB",
  de: "de-DE",
}

export function formatApplicationDateTime(date: string | undefined, locale: AppLocale): string {
  if (!date) return "—"
  try {
    const formatter = new Intl.DateTimeFormat(DATE_TIME_LOCALES[locale], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    return formatter.format(new Date(date))
  } catch {
    return "—"
  }
}

export function formatShortDate(date: string | undefined, locale: AppLocale): string {
  if (!date) return "—"
  try {
    const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    return formatter.format(new Date(date))
  } catch {
    return "—"
  }
}

export function getFilenameFromUrl(url?: string | null): string {
  if (!url) return ""
  return url.substring(url.lastIndexOf("/") + 1)
}
