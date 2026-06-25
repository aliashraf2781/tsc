import { NewsPage } from "@/features/news"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function NewsRoutePage({ params }: Props) {
  const { locale } = await params
  // eslint-disable-next-line no-console
  console.debug(`[news route] params.locale=${locale}`)
  return <NewsPage locale={locale} />
}
