import { getLocale, getTranslations, setRequestLocale } from "next-intl/server"
import type { SuccessStory } from "@/lib/api/types"
import { getSuccessStories } from "@/lib/api/services/success-stories.service"
import { TestimonialsCarousel } from "@/features/testimonials/components/testimonials-carousel"

type TestimonialsSectionProps = {
  override?: {
    title?: string
    description?: string
  }
}

const FALLBACK_KEYS = ["jacob", "ronald", "albert", "lina", "youssef", "nora"] as const

function buildFallbackStories(
  t: Awaited<ReturnType<typeof getTranslations<"Landing.testimonials">>>
): SuccessStory[] {
  return FALLBACK_KEYS.map((key, index) => ({
    id: index + 1,
    name: t(`items.${key}.name`),
    role: t(`items.${key}.role`),
    quote: t(`items.${key}.quote`),
    image: null,
  }))
}

export async function TestimonialsSection({ override }: TestimonialsSectionProps) {
  const locale = await getLocale()
  setRequestLocale(locale)
  const t = await getTranslations("Landing.testimonials")
  const isRtl = typeof locale === "string" && locale.startsWith("ar")

  let stories: SuccessStory[] = []
  try {
    const { data } = await getSuccessStories(locale, { per_page: 12 })
    stories = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    stories = []
  }

  if (!Array.isArray(stories) || stories.length === 0) {
    stories = buildFallbackStories(t)
  }

  return (
    <TestimonialsCarousel
      stories={stories}
      isRtl={isRtl}
      labels={{
        eyebrow: t("eyebrow"),
        title: override?.title ?? t("title"),
        description: override?.description ?? t("description"),
      }}
    />
  )
}
