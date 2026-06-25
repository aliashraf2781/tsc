import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminHomePageContent } from "@/lib/api/services/home-page.service"
import { AdminHomePanel } from "@/features/admin/components/admin-home-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("Admin.home")

  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let content = null
  let loadError: string | null = null

  try {
    // Fetch content for all supported locales so admin can edit translations
    const [arContent, enContent, deContent] = await Promise.all([
      getAdminHomePageContent(session.accessToken!, "ar"),
      getAdminHomePageContent(session.accessToken!, "en"),
      getAdminHomePageContent(session.accessToken!, "de"),
    ])
    // Do not mutate the returned objects (avoid circular refs). Create a
    // new wrapper object that contains the primary locale content and a
    // separate `__allLocales` map so we can pass both to the client safely.
    const allLocales = { ar: arContent, en: enContent, de: deContent }
    content = { ...(arContent || {}), __allLocales: allLocales } as any
  } catch (err) {
    console.error(err)
    loadError = t("loadError")
  }
  // Build a small, stable fingerprint to force remount when essential
  // editable content changes (avoid stringifying the whole object).
  const remountKey = content
    ? [content.hero?.title ?? "", content.hero?.description ?? "", (content.processSteps ?? []).map((s: any) => s.icon ?? s.title ?? "").join("|")].join("||")
    : "empty"

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      {loadError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      )}
      <AdminHomePanel key={remountKey} content={content} locale={locale} loadError={loadError} />
    </AdminPageLayout>
  )
}
