import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminSuccessStory } from "@/lib/api/services/success-stories.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminSuccessStoryEditForm } from "@/features/admin/components/admin-success-story-edit-form"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminSuccessStoryEditPage({ params }: PageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const isRTL = locale === "ar"

  // Fetch for all locales so the edit form can fill each language tab
  const [arItem, enItem, deItem] = await Promise.all([
    getAdminSuccessStory(id, session.accessToken, "ar"),
    getAdminSuccessStory(id, session.accessToken, "en"),
    getAdminSuccessStory(id, session.accessToken, "de"),
  ])

  if (!arItem && !enItem && !deItem) {
    notFound()
  }

  const base = (locale === "en" ? enItem : locale === "de" ? deItem : arItem) || arItem || enItem || deItem
  const story = { ...(base as object), __allLocales: { ar: arItem, en: enItem, de: deItem } }

  return (
    <AdminPageLayout
      title={isRTL ? `تعديل قصة نجاح — ${base?.name ?? ""}` : `Edit Success Story — ${base?.name ?? ""}`}
      description={
        isRTL
          ? `تعديل بيانات القصة وتعديل الترجمات الخاصة بالاسم والدور والاقتباس · ID: ${base?.id}`
          : `Edit success story data, translations, and profile picture · ID: ${base?.id}`
      }
    >
      <AdminSuccessStoryEditForm story={story} locale={locale} />
    </AdminPageLayout>
  )
}
