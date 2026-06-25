// app/[locale]/dashboard/page.tsx
import { redirect } from "next/navigation"
import { getSession, getCanonicalRole, normalizeRole } from "@/lib/auth-token"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const session = await getSession()
  const { locale } = await params

  // 1. التحقق من تسجيل الدخول
  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  // 2. خريطة التوجيه حسب الدور
  const dashboardMap: Record<string, string> = {
    user: "/dashboard/user",
    company: "/dashboard/company",
    admin: "/dashboard/admin",
  }
  // Prefer the canonical role which may fetch a fresh profile / refresh tokens
  // if the in-session user shape doesn't include authoritative role data.
  let finalRole: string = normalizeRole(session.user)
  try {
    const canonical = await getCanonicalRole(session)
    finalRole = canonical
  } catch {
    // if canonicalization fails, fall back to session role
  }
  const targetPath = dashboardMap[finalRole as keyof typeof dashboardMap] ?? null

  // 3. إعادة التوجيه أو خطأ
  if (!targetPath) {
    redirect(`/${locale}/sign-in?error=invalid_role`)
  }

  redirect(`/${locale}${targetPath}`)
}