import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getServiceRaw } from "@/lib/api/services/services.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminServiceEditForm } from "@/features/admin/components/admin-service-edit-form"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminServiceEditPage({ params }: PageProps) {
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
  // Show endpoint is locale-scoped (title/description as current-locale strings),
  // so fetch ar/en/de separately and stitch them for the multilingual edit form.
  const [arService, enService, deService] = await Promise.all([
    getServiceRaw(id, "ar"),
    getServiceRaw(id, "en"),
    getServiceRaw(id, "de"),
  ])

  if (!arService && !enService && !deService) {
    notFound()
  }

  const allLocales = { ar: arService, en: enService, de: deService }
  const base = arService || enService || deService || {}
  const service = { ...(base as any), __allLocales: allLocales } as any

  return (
    <AdminPageLayout
      title={isRTL ? `تعديل الخدمة — ${service.title}` : `Edit Service — ${service.title}`}
      description={
        isRTL
          ? `تعديل بيانات الخدمة ومزاياها · ID: ${service.id}`
          : `Edit service data and features · ID: ${service.id}`
      }
    >
      <AdminServiceEditForm service={service} locale={locale} />
    </AdminPageLayout>
  )
}
