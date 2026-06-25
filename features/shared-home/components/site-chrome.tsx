"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { stripLocalePrefix } from "@/i18n/navigation"
import { DashboardMobileMenuProvider } from "@/features/shared-home/components/dashboard-mobile-menu-context"
import { SiteHeader } from "@/features/shared-home/components/site-header"
import { seedSessionCache } from "@/hooks/use-auth"

type SiteChromeProps = {
  children: React.ReactNode
  footer?: React.ReactNode
  session?: {
    isLoggedIn: boolean
    user?: {
      id: number
      name: string
      email: string
      role: "user" | "company" | "admin"
      avatar?: string
      company?: Record<string, unknown>
      company_profile?: Record<string, unknown>
      companyProfile?: Record<string, unknown>
    } | null
  }
}

// Type the global window marker to avoid `any` casts and lint errors.
declare global {
  interface Window {
    __CANONICAL_USER?: {
      id?: number
      name?: string
      email?: string
      role?: string | Record<string, unknown>
      avatar?: string
    }
  }
}

const AUTH_ROUTES = new Set(["sign-in", "sign-up", "forgot-password", "verify-email"])

export function SiteChrome({ children, footer, session }: SiteChromeProps) {
  const pathname = usePathname() ?? "/"

  const isAuthPage = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments.at(-1)
    return lastSegment ? AUTH_ROUTES.has(lastSegment) : false
  }, [pathname])

  // Seed the module-level auth cache with SSR session data so child
  // components (header, sidebar) that call useAuth/useSession get the
  // correct initial state immediately and don't flash sign-in buttons.
  // This runs during the initial render (inside useState initializer)
  // which guarantees it executes before any child useEffect.
  const [initialSessionState, setInitialSessionState] = React.useState<typeof session>(() => {
    const s = session ?? { isLoggedIn: false, user: null }
    // Seed the session cache eagerly during the first render pass.
    if (s.isLoggedIn && s.user) {
      seedSessionCache({
        id: s.user.id,
        name: s.user.name,
        email: s.user.email,
        avatar: s.user.avatar,
        role: s.user.role,
        company: (s.user as any).company || undefined,
        company_profile: (s.user as any).company_profile || undefined,
        companyProfile: (s.user as any).companyProfile || undefined,
      })
    } else {
      seedSessionCache(null)
    }
    return s
  })

  // Keep the initial session state in sync when the server re-renders
  // (for example after `SessionPersist` calls `router.refresh()`). We
  // intentionally use state so the value is stable during the first
  // hydration but accepts updates from subsequent server renders.
  React.useEffect(() => {
    setInitialSessionState(session ?? { isLoggedIn: false, user: null })
  }, [session])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const current = sessionStorage.getItem("currentPath")
        if (current && current !== pathname) {
          sessionStorage.setItem("prevPath", current)
        }
        sessionStorage.setItem("currentPath", pathname)
      } catch (e) {
        console.error("Failed to track route history in sessionStorage:", e)
      }
    }
  }, [pathname])

  // Compute `isDashboard` dynamically on every render based on the current pathname.
  // This ensures that navigating between dashboard and public pages updates the
  // layout, headers, and footers correctly. Since usePathname is consistent between
  // SSR and hydration, this will not cause hydration mismatches.
  const isDashboard = React.useMemo(() => {
    const normalizedPath = stripLocalePrefix(pathname)
    const segments = (normalizedPath ?? "/").split("/").filter(Boolean)
    return segments.includes("dashboard")
  }, [pathname])

  return (
    <DashboardMobileMenuProvider>
      {!isAuthPage && (
        <SiteHeader
          initialIsLoggedIn={initialSessionState?.isLoggedIn}
          initialUser={initialSessionState?.user}
          isDashboard={isDashboard}
        />
      )}

      {isDashboard ? children : <main className="flex-1">{children}</main>}

      {!isAuthPage && !isDashboard && footer}
    </DashboardMobileMenuProvider>
  )
}

