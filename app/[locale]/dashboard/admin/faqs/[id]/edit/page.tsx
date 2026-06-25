import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminFaqItem } from "@/lib/api/services/faqs.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminFaqEditForm } from "@/features/admin/components/admin-faq-edit-form"

export default async function AdminFaqEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  // Fetch FAQ for all locales so admin can edit translations
  const [arItem, enItem, deItem] = await Promise.all([
    getAdminFaqItem(id, session.accessToken!, "ar"),
    getAdminFaqItem(id, session.accessToken!, "en"),
    getAdminFaqItem(id, session.accessToken!, "de"),
  ])

  if (!arItem && !enItem && !deItem) {
    redirect(`/${locale}/dashboard/admin/faqs`)
  }

  const base = arItem || enItem || deItem || {}
  const faq = { ...(base as any), __allLocales: { ar: arItem, en: enItem, de: deItem } } as any

  const isRTL = locale === "ar"

  return (
    <AdminPageLayout
      title={isRTL ? "تعديل سؤال" : "Edit FAQ"}
      description={isRTL ? "تعديل السؤال والإجابة" : "Edit the question and its answer"}
    >
      <AdminFaqEditForm faq={faq} locale={locale} />
    </AdminPageLayout>
  )
}
