import { redirect } from "next/navigation"
import { getSession, getCanonicalRole } from "@/lib/auth-token"

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const session = await getSession()

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  const canonical = await getCanonicalRole(session)

  if (canonical !== "admin") {
    // Not an admin -> redirect to generic dashboard root which will further
    // route the user to their role-specific dashboard.
    redirect(`/${locale}/dashboard`)
  }

  return <>{children}</>
}
