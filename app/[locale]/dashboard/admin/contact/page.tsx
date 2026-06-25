import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getContactMessages } from "@/lib/api/services/contact-messages.service"
import { AdminContactMessagesPanel } from "@/features/admin/components/admin-contact-messages-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminContactPage({
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

  const messages = await getContactMessages(session.accessToken, locale).catch(() => [])

  const title = locale === "ar" ? "رسائل التواصل" : locale === "de" ? "Kontaktnachrichten" : "Contact Messages"
  const description =
    locale === "ar"
      ? "عرض وإدارة الرسائل الواردة من نموذج التواصل"
      : locale === "de"
        ? "Eingehende Kontaktformular-Nachrichten anzeigen und verwalten"
        : "View and manage messages submitted through the contact form"

  return (
    <AdminPageLayout title={title} description={description}>
      <AdminContactMessagesPanel messages={messages} locale={locale} />
    </AdminPageLayout>
  )
}
