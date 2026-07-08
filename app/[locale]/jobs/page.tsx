import { JobsPage } from "@/features/jobs/components/jobs-page"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function JobsRoutePage({ params }: Props) {
  const { locale } = await params
  // eslint-disable-next-line no-console
  // console.debug(`[jobs route] params.locale=${locale}`)
  return <JobsPage locale={locale} />
}

export const dynamic = "force-dynamic"
