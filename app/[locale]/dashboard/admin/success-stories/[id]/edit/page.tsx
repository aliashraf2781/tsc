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
  
  // Fetch single success story directly by ID
  const story = await getAdminSuccessStory(id, session.accessToken, locale)

  if (!story) {
    notFound()
  }

  return (
    <AdminPageLayout
      title={isRTL ? `تعديل قصة نجاح — ${story.name}` : `Edit Success Story — ${story.name}`}
      description={
        isRTL
          ? `تعديل بيانات القصة وتعديل الترجمات الخاصة بالاسم والدور والاقتباس · ID: ${story.id}`
          : `Edit success story data, translations, and profile picture · ID: ${story.id}`
      }
    >
      <AdminSuccessStoryEditForm story={story} locale={locale} />
    </AdminPageLayout>
  )
}
