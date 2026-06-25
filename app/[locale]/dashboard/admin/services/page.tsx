import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getServices } from "@/lib/api/services/services.service"
import { AdminServicesPanel } from "@/features/admin/components/admin-services-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const services = await getServices(locale)

  return <AdminServicesPanel services={services} locale={locale} />
}
