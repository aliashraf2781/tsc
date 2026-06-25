import type { News } from "@/lib/api/types"
import { getNewsKeys } from "@/features/news/services/news.service"

const FALLBACK_IMAGES = [
  "/home/content/news-feature.png",
  "/home/content/news-1.png",
  "/home/content/news-2.png",
  "/home/content/news-3.png",
] as const

type NewsTranslator = {
  (key: string): string
}

export function buildFallbackNews(t: NewsTranslator): News[] {
  const keys = getNewsKeys()

  return keys.map((key, index) => ({
    id: index + 1,
    slug: key,
    title: t(`items.${key}.title`),
    excerpt: t(`items.${key}.description`),
    content: t(`items.${key}.description`),
    published_at: "2026-06-28T00:00:00.000Z",
    image: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
  }))
}

export async function getNewsForLocale(
  locale: string,
  t: NewsTranslator,
  options?: { per_page?: number }
): Promise<News[]> {
  const { getNews } = await import("@/lib/api/services/news.service")
  const { data } = await getNews({ per_page: options?.per_page ?? 8 }, locale)
  if (data.length > 0) return data
  return buildFallbackNews(t)
}
