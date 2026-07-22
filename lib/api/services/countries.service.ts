import { api } from "../client"
import type { Country } from "../types"

function parseList(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) return response as Record<string, unknown>[]
  if (response && typeof response === "object") {
    const root = response as Record<string, unknown>
    if (Array.isArray(root.data)) return root.data as Record<string, unknown>[]
  }
  return []
}

/**
 * Signup/login use dial codes with a leading "+" for `phone_code`.
 * API `code` may already be "+20", "20", or an ISO-like token ("US", "PAL").
 * Numeric dial values are normalized to "+digits"; alphabetic codes stay uppercase.
 */
export function normalizeCountryCode(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""

  const withoutPlus = trimmed.startsWith("+") ? trimmed.slice(1).trim() : trimmed
  if (/^\d+$/.test(withoutPlus)) {
    return `+${withoutPlus}`
  }

  return withoutPlus.toUpperCase()
}

export async function getCountries(locale = "ar", token?: string): Promise<Country[]> {
  const response = await api.get<unknown>("/countries", { locale, token })
  const parsed: Country[] = []

  for (const item of parseList(response)) {
    const id = Number(item.id)
    if (!Number.isFinite(id) || id <= 0) continue

    const name =
      typeof item.name === "string"
        ? item.name
        : item.name && typeof item.name === "object"
          ? String(
              (item.name as Record<string, string>)[locale] ||
                (item.name as Record<string, string>).en ||
                (item.name as Record<string, string>).ar ||
                ""
            )
          : ""

    const code = typeof item.code === "string" ? item.code : String(item.code ?? "")
    parsed.push({
      id,
      name,
      code,
      ...(typeof item.flag === "string" ? { flag: item.flag } : {}),
    })
  }

  return parsed
}

/** Raw countries for a single locale (admin editors merge ar/en/de). */
export async function getCountriesRaw(locale?: string, token?: string): Promise<Record<string, unknown>[]> {
  try {
    const response = await api.get<unknown>("/countries", { locale, token, timeout: 15000 })
    return parseList(response)
  } catch (err) {
    console.error("[getCountriesRaw] error:", err)
    return []
  }
}

export async function createCountryAdmin(
  formData: FormData,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post<unknown>("/countries", formData, { token, locale })
}

export async function updateCountryAdmin(
  id: number,
  formData: FormData,
  token: string,
  locale = "ar"
): Promise<void> {
  formData.delete("id")
  await api.post<unknown>(`/countries/${id}`, formData, { token, locale })
}

export async function deleteCountryAdmin(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/countries/${id}`, { token, locale })
}
