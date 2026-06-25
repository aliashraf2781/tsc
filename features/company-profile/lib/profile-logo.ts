import { getCompanyLogo, getJobCompanyLogo } from "@/features/jobs/lib/job-display"
import { resolveImageUrl } from "@/lib/utils"

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function resolveLogoUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined
  const trimmed = value.trim()
  try {
    return resolveImageUrl(trimmed)
  } catch {
    return trimmed
  }
}

/** Extract current company logo from /auth/profile response (same priority as profile page). */
export function getProfileCompanyLogo(profile: unknown): string | undefined {
  if (!profile || typeof profile !== "object") return undefined

  const raw = asRecord(profile)
  const cp = asRecord(raw.companyProfile ?? raw.company_profile ?? raw.company)

  const candidates = [
    cp.logoUrl,
    cp.logo_url,
    cp.logo,
    raw.logo,
    // Do NOT use raw.avatar/raw.avatar_url as company logo — those are
    // often the personal avatar of the user and should not replace
    // company branding when displaying company logos.
  ]

  for (const candidate of candidates) {
    const resolved = resolveLogoUrl(candidate)
    if (resolved) return resolved
  }

  return getCompanyLogo({ ...raw, ...cp })
}

export function getProfileCompanyName(profile: unknown, locale = "ar"): string {
  if (!profile || typeof profile !== "object") return ""

  const raw = asRecord(profile)
  const cp = asRecord(raw.companyProfile ?? raw.company_profile ?? raw.company)

  const localized = (value: unknown): string => {
    if (typeof value === "string") return value
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>
      return String(obj[locale] ?? obj.ar ?? obj.en ?? obj.de ?? "")
    }
    return ""
  }

  return (
    localized(raw.company_name) ||
    localized(cp.companyName) ||
    String(raw.name ?? cp.name ?? "")
  ).trim()
}

export function getCompanyInitials(name?: string): string {
  const trimmed = String(name ?? "").trim()
  if (!trimmed) return "—"
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase()
}

/** Prefer live profile logo over stale job.company.logo embedded in job payloads. */
export function resolveCompanyLogoForDisplay(
  company?: unknown,
  profileLogo?: string | null,
  job?: unknown
): string | undefined {
  const live = profileLogo?.trim()
  if (live) return live

  if (job) {
    const logo = getJobCompanyLogo(job as any)
    if (logo) return logo
  }

  return getCompanyLogo(company as any)
}
