export function localizedField(
  value: string | Record<string, string> | undefined,
  locale: string
): string {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[locale] || value.en || value.ar || value.de || ""
}
