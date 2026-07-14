import type { Category } from "@/lib/api/types"
import { LOCALES, type LocalizedName } from "./category-form-schema"

export function emptyLocalizedName(): LocalizedName {
  return { ar: "", en: "", de: "" }
}

export function makeCategoryKey() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

export type CategoryFormDefaults = {
  name: LocalizedName
  subCategories: { subCategoryId?: number; name: LocalizedName }[]
}

export function mapCategoryToFormDefaults(category?: Category): CategoryFormDefaults {
  if (!category) return { name: emptyLocalizedName(), subCategories: [] }

  const subCategories = ((category as unknown as { sub_categories?: unknown[] }).sub_categories ?? []) as Array<{
    id?: number
    name?: unknown
  }>

  return {
    name: toLocalizedName((category as unknown as { name?: unknown }).name),
    subCategories: subCategories.map((s) => ({
      subCategoryId: s.id,
      name: toLocalizedName(s.name),
    })),
  }
}

// Backend requires name[ar]/name[en]/name[de] all present; fill untranslated
// locales with whichever locale the admin actually typed (only en/de are
// editable via the UI tabs, ar rides along as a fallback copy).
export function fillLocaleFallback(name: LocalizedName): LocalizedName {
  const fallback = LOCALES.map((l) => name[l]?.trim()).find(Boolean) || ""
  return {
    ar: name.ar?.trim() || fallback,
    en: name.en?.trim() || fallback,
    de: name.de?.trim() || fallback,
  }
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]/g, "")
}
