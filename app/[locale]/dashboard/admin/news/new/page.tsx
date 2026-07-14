import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminNewsCreateForm } from "@/features/admin/components/admin-news-create-form"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function AdminNewsNewPage({ params }: PageProps) {
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
      title={isRTL ? "إضافة خبر جديد" : "Create New News Article"}
      description={
        isRTL
          ? "أدخل تفاصيل الخبر الجديد وترجماته وعين صورة لعرضه في قسم الأخبار والمقالات"
          : "Enter the details, translations, and set an image for the new article displayed on public news section"
      }
    >
      <AdminNewsCreateForm locale={locale} />
    </AdminPageLayout>
  )
}
