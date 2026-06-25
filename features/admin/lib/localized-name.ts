export function pickLocalizedName(value: unknown, locale: string): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const map = value as Record<string, string>
    return map[locale] ?? map.ar ?? map.en ?? map.de ?? Object.values(map)[0] ?? "—"
  }
  return "—"
}
