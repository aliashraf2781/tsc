import { resolveAppLocale } from "./company-application-detail-labels"

const DATE_LOCALES = { ar: "ar-EG", en: "en-GB", de: "de-DE" }

export function formatApplicationDate(dateStr: string | null | undefined, locale?: string): string {
  if (!dateStr) return "—"
  try {
    return new Intl.DateTimeFormat(DATE_LOCALES[resolveAppLocale(locale)], {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export function calcApplicantAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null
  const birth = new Date(dateOfBirth)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

/** Strips the storage path and `-`/`_` separators, leaving a readable display name. */
export function getAttachmentFilename(url?: string | null): string {
  if (!url) return ""
  try {
    const filename = String(url).split("/").pop() || String(url)
    return decodeURIComponent(filename).replace(/[-_]+/g, " ")
  } catch {
    return String(url)
  }
}
