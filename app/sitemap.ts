// app/sitemap.ts
import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://talentseeker.com"
const LOCALES = ["ar", "en", "de"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: "", priority: 1.0, changeFreq: "weekly" as const },
    { path: "/about", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/jobs", priority: 0.9, changeFreq: "daily" as const },
    { path: "/news", priority: 0.8, changeFreq: "weekly" as const },
  ]

  const staticEntries = staticPages.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFreq,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
        ),
      },
    }))
  )

  return staticEntries
}
