import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminUserById, getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminUserDetailView } from "@/features/admin/components/admin-user-detail-view"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let user: any = null
  try {
    user = await getAdminUserById(id, session.accessToken!, locale)
  } catch (err) {
    console.error(err)
  }

  // Fallback: search in getAdminUsers list with a large limit to avoid sequential loop overhead
  if (!user) {
    try {
      const result = await getAdminUsers(session.accessToken!, "user", 1, locale, 250)
      user = result.data.find((u: any) => String(u.id) === String(id)) || null
    } catch (e) {
      console.error("Fallback user search failed:", e)
    }
  }

  if (!user) {
    redirect(`/${locale}/dashboard/admin/users`)
  }

  const resolveUserTitle = () => {
    const name = user?.name
    if (!name) return ""
    if (typeof name === "string") return name
    return (name.ar || name.en || name.de || name.full_name || name.displayName || "") as string
  }

  return (
    <AdminPageLayout 
      title={resolveUserTitle()} 
      description={`User Profile - ${user.email}`}
    >
      <AdminUserDetailView user={user} locale={locale} />
    </AdminPageLayout>
  )
}
