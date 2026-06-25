import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { JobDetailPage } from "@/features/jobs/components/job-detail-page"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function JobDetailRoutePage({ params }: Props) {
  const { id, locale } = await params
  setRequestLocale(locale)
  // eslint-disable-next-line no-console
  console.debug(`[jobs route detail] params.locale=${locale} id=${id}`)
  const jobId = Number(id)
  if (!Number.isFinite(jobId) || jobId <= 0) notFound()

  return <JobDetailPage jobId={jobId} locale={locale} />
}
