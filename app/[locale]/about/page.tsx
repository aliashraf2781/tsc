import { AboutPage } from "@/features/about"
import { setRequestLocale } from "next-intl/server"

export default async function AboutUsRoutePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <AboutPage />
}

export const dynamic = "force-dynamic"
