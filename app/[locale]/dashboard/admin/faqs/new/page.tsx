import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminFaqCreateForm } from "@/features/admin/components/admin-faq-create-form"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function AdminFaqNewPage({ params }: PageProps) {
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
      title={isRTL ? "إضافة سؤال شائع" : "Add FAQ"}
      description={isRTL ? "أضف سؤالاً وإجابته" : "Add a question and its answer"}
    >
      <AdminFaqCreateForm locale={locale} />
    </AdminPageLayout>
  )
}
