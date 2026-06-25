import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminSettings } from "@/lib/api/services/settings.service"
import { AdminSettingsPanel } from "@/features/admin/components/admin-settings-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("Admin.settings")

  if (!session.user || normalizeRole(session.user) !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken

  const settings = await getAdminSettings(token, locale).catch(() => [])

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminSettingsPanel settings={settings} locale={locale} />
    </AdminPageLayout>
  )
}
