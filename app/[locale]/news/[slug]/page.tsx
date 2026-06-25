import { setRequestLocale } from "next-intl/server"
import { NewsDetailPage } from "@/features/news/components/news-detail-page"

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

export default async function SingleNewsRoutePage({ params }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  // eslint-disable-next-line no-console
  console.debug(`[news route detail] params.locale=${locale} slug=${slug}`)
  return <NewsDetailPage slug={slug} locale={locale} />
}
