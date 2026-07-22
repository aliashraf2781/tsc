import { normalizeCountryCode } from "@/lib/api/services/countries.service"
import {
  emptyLocalizedName,
  fillLocaleFallback,
} from "./category-form-utils"
import type { AdminCountry, CountryFormValues, LocalizedName } from "./country-form-schema"

export { emptyLocalizedName, fillLocaleFallback }

export function makeCountryKey() {
  return `new-country-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toLocalizedName(val: unknown): LocalizedName {
  if (!val) return emptyLocalizedName()
  if (typeof val === "string") return { ar: val, en: val, de: val }
  const obj = val as Record<string, string>
  return {
    ar: obj.ar ?? obj.name ?? obj.en ?? obj.de ?? "",
    en: obj.en ?? obj.name ?? obj.ar ?? obj.de ?? "",
    de: obj.de ?? obj.name ?? obj.ar ?? obj.en ?? "",
  }
}

export function mapCountryToFormDefaults(country?: AdminCountry): CountryFormValues {
  if (!country) {
    return { name: emptyLocalizedName(), code: "" }
  }
  return {
    name: toLocalizedName(country.name),
    code: country.code ? normalizeCountryCode(country.code) : "",
  }
}

/** Display code in the UI the same way signup expects dial codes. */
export function formatCountryCodeForDisplay(code: string): string {
  return normalizeCountryCode(code)
}
