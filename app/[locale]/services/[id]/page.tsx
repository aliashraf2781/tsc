import { getTranslations } from "next-intl/server"
import { getServices } from "@/lib/api/services/services.service"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { ServiceDetailsClient } from "./service-details-client"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function ServiceDetailsPage({ params }: PageProps) {
  const { locale, id } = await params
  const t = await getTranslations("Landing.servicesPage")

  // Fetch all database services
  const services = await getServices(locale)
  let service = services.find((s) => String(s.id) === id) || null

  // Fallback default services if not present in database
  const defaultServices = [
    {
      id: 1,
      title: t("defaults.one.title"),
      description: t("defaults.one.description"),
      image: "",
      features: [],
    },
    {
      id: 2,
      title: t("defaults.two.title"),
      description: t("defaults.two.description"),
      image: "",
      features: [],
    },
    {
      id: 3,
      title: t("defaults.three.title"),
      description: t("defaults.three.description"),
      image: "",
      features: [],
    },
  ]

  // Use database service or match the fallback
  if (!service) {
    service = defaultServices.find((ds) => String(ds.id) === id) || null
  }

  if (!service) {
    return (
      <main className="flex-1 bg-white py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("notFoundTitle")}
        </h1>
        <Link
          locale={locale}
          href="/services"
          className="mt-4 inline-flex items-center gap-2 text-[#006EA8] hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>{t("backToServices")}</span>
        </Link>
      </main>
    )
  }

  return <ServiceDetailsClient service={service} locale={locale} />
}
