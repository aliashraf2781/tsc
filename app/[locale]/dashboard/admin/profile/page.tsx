// Server wrapper — prefetches the admin's profile data then renders the client form
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getProfile } from "@/lib/api/services/auth.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import AdminProfileClient from "./client"

export const dynamic = "force-dynamic"

export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (session.user && normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const needsClientPersist = Boolean(
    (session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist
  )
  const initialAuthTokens = (
    session as unknown as {
      __persistTokens?: { access_token?: string; refresh_token?: string }
    }
  ).__persistTokens

  // Prefetch admin profile server-side so the form has initial values
  let initialProfile: Record<string, any> | undefined = undefined
  try {
    const profile = await getProfile(session.accessToken!, locale)
    if (profile) {
      initialProfile = {
        id: profile.id,
        name: profile.name || "",
        email: profile.email || "",
        phone: (profile as any).phone || "",
        avatar: (profile as any).avatar || "",
        role: (profile as any).role || "admin",
        locale: (profile as any).locale || locale,
      }
    }
  } catch {
    // Client will fall back to its own fetch
  }

  const isAr = locale === "ar"
  const isDe = locale === "de"

  return (
    <AdminPageLayout
      title={isAr ? "الملف الشخصي" : isDe ? "Mein Profil" : "My Profile"}
      description={isAr ? "إدارة بيانات حسابك الشخصي" : isDe ? "Verwalten Sie Ihre persönlichen Kontodaten" : "Manage your personal account details"}
      needsClientPersist={needsClientPersist}
      initialAuthTokens={initialAuthTokens}
    >
      <AdminProfileClient locale={locale} initialProfile={initialProfile} />
    </AdminPageLayout>
  )
}
