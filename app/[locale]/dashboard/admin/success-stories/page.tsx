import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminSuccessStories } from "@/lib/api/services/success-stories.service"
import { AdminSuccessStoriesPanel } from "@/features/admin/components/admin-success-stories-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminSuccessStoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("Admin.successStories")

  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let stories: Awaited<ReturnType<typeof getAdminSuccessStories>>["data"] = []
  let loadError: string | null = null

  try {
    const result = await getAdminSuccessStories(session.accessToken!, locale, { per_page: 50 })
    stories = result.data
  } catch (err) {
    console.error(err)
    loadError = t("loadError")
  }

  return (
    <>
      {loadError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      )}
      <AdminSuccessStoriesPanel stories={stories} />
    </>
  )
}
