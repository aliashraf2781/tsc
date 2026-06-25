import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-token"
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell"

// Ensure the dashboard layout uses the authoritative upstream profile when
// possible so the client sidebar gets the canonical `role` immediately.

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await getSession()
  const { locale } = await params

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  const { user } = session

  // Use session user directly on the server; do not call `getProfile` here.
  const canonicalUser = user

  // Instead of emitting inert DOM markers and relying on client-side DOM
  // reads (which caused hydration mismatches), pass the canonical user
  // directly into the dashboard shell. The top-level layout already
  // attempts to canonicalize; this ensures server -> client parity.
  return (
    <DashboardShell locale={locale} user={canonicalUser}>{children}</DashboardShell>
  )
}