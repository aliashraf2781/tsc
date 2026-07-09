import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminServiceCreateForm } from "@/features/admin/components/admin-service-create-form"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function AdminServiceNewPage({ params }: PageProps) {
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
      title={isRTL ? "إضافة خدمة جديدة" : "Add New Service"}
      description={
        isRTL
          ? "أنشئ خدمة جديدة بعنوانها وأوصافها ومزاياها بكل اللغات"
          : "Create a new service with titles, descriptions, and features in all languages"
      }
    >
      <AdminServiceCreateForm locale={locale} />
    </AdminPageLayout>
  )
}
