export function resolveJobImageUrl(image?: string | null): string | null {
  if (!image?.trim()) return null
  const trimmed = image.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed

  const base = (
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/api\/v1\/?$/, "")

  if (!base) return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`
}
