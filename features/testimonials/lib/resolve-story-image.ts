const FALLBACK_IMAGES = [
  "/home/content/testimonial-left.png",
  "/home/content/testimonial-center.png",
  "/home/content/testimonial-right-1.png",
  "/home/content/testimonial-right-2.png",
] as const

export function resolveStoryImageUrl(image?: string | null, index = 0): string {
  const src = image?.trim()
  if (!src) return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]

  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src
  }

  const base = (process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(
    /\/api\/v1\/?$/,
    ""
  )
  if (!base) return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  return `${base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`
}
