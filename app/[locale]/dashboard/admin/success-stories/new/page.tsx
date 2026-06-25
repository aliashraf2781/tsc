import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminSuccessStoryEditForm } from "@/features/admin/components/admin-success-story-edit-form"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function AdminSuccessStoryNewPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const isRTL = locale === "ar"

  return (
    <AdminPageLayout
      title={isRTL ? "إضافة قصة نجاح جديدة" : "Add New Success Story"}
      description={
        isRTL
          ? "أدخل تفاصيل قصة النجاح والترجمات وارفع صورة لعرضها في الصفحة الرئيسية"
          : "Add details, localization translations, and set a profile image for the success story to show on landing page"
      }
    >
      <AdminSuccessStoryEditForm locale={locale} isNew={true} />
    </AdminPageLayout>
  )
}
