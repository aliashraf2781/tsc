'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  roles?: string[]
  company?: any
  company_profile?: any
  companyProfile?: any
}

// Small helper to abort fetches that take too long (client-side UX improvement)
async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const merged = { ...(init || {}), signal: controller.signal } as RequestInit
    const res = await fetch(input, merged)
    clearTimeout(id)
    return res
  } catch (err) {
    clearTimeout(id)
    throw err
  }
}

// ── Module-level cache shared across all hook instances ──────────────────────
let cachedUser: AuthUser | null = null
let isFetchingUser = false
let hasFetchedUser = false
/** True after SSR data has been seeded into the cache. Prevents the brief
 *  flash of unauthenticated UI that occurs when the module-level cache is
 *  empty on a fresh page load but the server already provided a user. */
let isSeeded = false
const listeners = new Set<(u: AuthUser | null) => void>()
const refetchListeners = new Set<() => void>()

function emit(user: AuthUser | null) {
  cachedUser = user
  listeners.forEach((l) => l(user))
}

/** Force all mounted useAuth instances to re-fetch on next render */
export function invalidateSessionCache() {
  cachedUser = null
  hasFetchedUser = false
  isSeeded = false
  refetchListeners.forEach((r) => r())
}

/**
 * Seed the module-level session cache with data from SSR so that the first
 * client render already has the correct auth state. Must be called BEFORE
 * any useAuth/useSession hooks run (e.g. in a top-level useEffect in the
 * root layout or SiteChrome). Seeding is a one-time operation per page load;
 * subsequent calls are no-ops unless `invalidateSessionCache()` was called.
 */
export function seedSessionCache(user: AuthUser | null) {
  if (isSeeded) return
  isSeeded = true
  cachedUser = user
  hasFetchedUser = true
  emit(user)
}

/** Update the cached user data without a refetch (e.g. after profile update) */
export function updateSessionUser(partial: Partial<AuthUser>) {
  const base = cachedUser || ({} as AuthUser)
  const updated = { ...base, ...partial }
  hasFetchedUser = true
  emit(updated)
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname ? (
    pathname.includes("/sign-in") || 
    pathname.includes("/sign-up") || 
    pathname.includes("/forgot-password") || 
    pathname.includes("/reset-password") || 
    pathname.includes("/verify")
  ) : false

  const [user, setUser] = useState<AuthUser | null>(cachedUser)
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cachedUser or have already fetched, we are not loading.
    if (cachedUser || hasFetchedUser) return false
    // If we are on an auth page, we do not fetch, so we are not loading.
    return !isAuthPage
  })
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (force = false) => {
    if (hasFetchedUser && !force) {
      setUser(cachedUser)
      setIsLoading(false)
      return
    }

    if (isFetchingUser) return

    isFetchingUser = true
    setIsLoading(true)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const res = await fetchWithTimeout(`/api/auth/profile?t=${Date.now()}`, { 
        cache: "no-store", 
        credentials: "include",
        headers: { "Accept-Language": clientLocale }
      }, 10000)
      hasFetchedUser = true
      if (res.ok) {
        const data = await res.json()
        const userObj = data?.data || data
        if (userObj) {
          const rawRole = userObj.role || (userObj.roles && userObj.roles[0]) || "user"
          const roleStr = String(rawRole).toLowerCase()
          const rNormalized = roleStr.includes('admin') ? 'admin' : (roleStr.includes('company') || roleStr.includes('employer') ? 'company' : 'user')
          const cp = userObj.companyProfile || userObj.company_profile || userObj.company
          const companyLogo = cp ? (cp.logoUrl || cp.logo || cp.logo_url || cp.avatar || cp.avatar_url) : undefined
          if (rNormalized === 'company' && companyLogo) {
            userObj.avatar = companyLogo
          }
        }
        emit(userObj)
        setError(null)
      } else if (res.status === 401) {
        emit(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        setError(errData.message || "Failed to load profile")
      }
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        setError('Request timed out fetching profile')
      } else {
        setError("Network error fetching profile")
      }
    } finally {
      isFetchingUser = false
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    const onChange = (u: AuthUser | null) => setUser(u)
    const onRefetch = () => {
      fetchProfile(true)
    }
    listeners.add(onChange)
    refetchListeners.add(onRefetch)
    
    if (!isAuthPage) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }

    return () => {
      listeners.delete(onChange)
      refetchListeners.delete(onRefetch)
    }
  }, [fetchProfile, isAuthPage])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true)
    // Logout: just call server route and clear client cache. Do NOT touch
    // any client-side token templates or flags — persistence is server-side.

    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        headers: { "Accept-Language": clientLocale }
      })
    } catch { /* ignore */ } finally {
      // Clear client-side cache BEFORE navigating so the header/sidebar
      // immediately reflect the logged-out state with no avatar flash.
      cachedUser = null
      hasFetchedUser = true
      isSeeded = false
      emit(null)

      // Only force redirect to sign-in if the user is currently on a dashboard/protected page.
      // On public pages, just refresh so the header updates without a jarring redirect.
      const isDashboardPage = pathname ? pathname.includes("/dashboard") || pathname.includes("/sign-out") : false
      const targetPath = isDashboardPage ? `/${clientLocale}/sign-in` : `/${clientLocale}`

      if (typeof window !== "undefined") {
        if (isDashboardPage) {
          // Hard redirect away from protected page
          window.location.href = targetPath
        } else {
          // Just refresh the current public page to reflect logged-out state
          window.location.reload()
        }
      } else {
        setIsLoading(false)
        try { router.push(targetPath) } catch {}
        try { router.refresh() } catch {}
      }
    }
  }, [router, pathname])

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string, type = "user") => {
    setIsLoading(true)
    setError(null)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const res = await fetchWithTimeout("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept-Language": clientLocale
        },
        credentials: "include",
        body: JSON.stringify({ email, password, type }),
      }, 10000)
      const data = await res.json()

      // Email not verified – redirect to verify page
      if (res.status === 403 && data?.pendingVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email || email)}`)
        return
      }

      if (!res.ok) throw new Error(data.message || "Login failed")

      // Wait a short time to allow the server to set HttpOnly cookies,
      // then verify the session by re-fetching the profile via our
      // proxied `/api/auth/profile` route (which reads cookies server-side).
      await new Promise((r) => setTimeout(r, 100))
      try {
        await fetchProfile(true)
        if (!cachedUser) {
          const msg = "Failed to verify session after login"
          setError(msg)
          throw new Error(msg)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to verify session after login")
        throw err
      }

      const rawRole = data.role || (cachedUser && (cachedUser.role || (cachedUser.roles && cachedUser.roles[0]))) || type
      const roleStr = String(rawRole || type).toLowerCase()
      const dest = roleStr.includes('admin') ? '/dashboard/admin' : (roleStr.includes('company') || roleStr.includes('employer') ? '/dashboard/company' : '/dashboard/user')
      try {
        if (typeof window !== 'undefined') {
          window.location.href = dest
        } else {
          await router.replace(dest)
        }
      } catch {}
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        setError('Login request timed out')
      } else {
        setError(err instanceof Error ? err.message : "Login failed")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, fetchProfile])

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (payload: {
    name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
    type: "user" | "company"
    company_name?: string
    country_id?: number
    accept_terms_and_privacy?: boolean
  }) => {
    setIsLoading(true)
    setError(null)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept-Language": clientLocale
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Registration failed")

      // If server explicitly requests pending verification
      if (data.pendingVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email || payload.email)}&type=${encodeURIComponent(payload.type)}`)
        return
      }

      const registeredUser = data.user || null

      // Helper: determine whether user is verified (check common fields)
      const userIsVerified = (u: any) => {
        if (!u) return true
        if (typeof u.emailVerified === 'boolean') return u.emailVerified
        if (u.email_verified_at !== undefined) return Boolean(u.email_verified_at)
        if (typeof u.email_verified === 'boolean') return u.email_verified
        if (u.status && (u.status === 'pending' || u.status === 'inactive')) return false
        return true
      }

      if (!userIsVerified(registeredUser)) {
        router.push(`/verify-email?email=${encodeURIComponent(payload.email)}&type=${encodeURIComponent(payload.type)}`)
        return
      }

      // Determine dashboard path from returned user role or fallback to requested type
      const getDashboardPathFromUser = (u: any, fallback: string) => {
        const raw = u?.role || (Array.isArray(u?.roles) && u.roles[0]) || fallback
        const s = String(raw || fallback || 'user').toLowerCase()
        if (s.includes('admin')) return '/dashboard/admin'
        if (s.includes('company') || s.includes('employer')) return '/dashboard/company'
        return '/dashboard/user'
      }

      hasFetchedUser = false
      if (registeredUser) emit(registeredUser)
      try {
        await fetchProfile(true)
      } catch {}
      const dest = getDashboardPathFromUser(registeredUser, payload.type)
      try {
        await router.replace(dest)
      } catch {}
      try {
        router.refresh()
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, fetchProfile])

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const formData = new FormData()
      formData.append("email", email)
      const res = await fetch("/api/auth/forgot-password", { 
        method: "POST", 
        headers: { "Accept-Language": clientLocale },
        body: formData 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send reset email")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Verify Reset Code ───────────────────────────────────────────────────────
  const verifyResetCode = useCallback(async (email: string, code: string): Promise<string> => {
    setIsLoading(true)
    setError(null)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("code", code)
      const res = await fetch("/api/auth/verify-reset-code", { 
        method: "POST", 
        headers: { "Accept-Language": clientLocale },
        body: formData 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Invalid code")
      return data?.data?.token || data?.token || ""
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Reset Password ──────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (token: string, password: string, password_confirmation: string) => {
    setIsLoading(true)
    setError(null)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const formData = new FormData()
      formData.append("token", token)
      formData.append("password", password)
      formData.append("password_confirmation", password_confirmation)
      const res = await fetch("/api/auth/reset-password", { 
        method: "POST", 
        headers: { "Accept-Language": clientLocale },
        body: formData 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to reset password")
      router.push("/sign-in")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // ── Verify Email ────────────────────────────────────────────────────────────
  const verifyEmail = useCallback(async (email: string, code: string, type?: "user" | "company" | "admin") => {
    setIsLoading(true)
    setError(null)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("code", code)
      const res = await fetch("/api/auth/verify", { 
        method: "POST", 
        headers: { "Accept-Language": clientLocale },
        body: formData 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Verification failed")
      const verifiedType = type ? `&type=${encodeURIComponent(type)}` : ""
      router.push(`/sign-in?verified=1${verifiedType}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // ── Resend Verification ─────────────────────────────────────────────────────
  const resendVerification = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)
    const clientLocale = pathname ? (pathname.split("/")[1] || "ar") : "ar"
    try {
      const formData = new FormData()
      formData.append("email", email)
      const res = await fetch("/api/auth/resend-verification", { 
        method: "POST", 
        headers: { "Accept-Language": clientLocale },
        body: formData 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to resend verification")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isLoading,
    /** @deprecated use isLoading */
    loading: isLoading,
    error,
    isAuthenticated: !!user,
    logout,
    /** @deprecated use logout */
    signOut: logout,
    signIn,
    signUp,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    verifyEmail,
    resendVerification,
    refetch: () => fetchProfile(true),
  }
}

/**
 * Compat alias — components that imported `useSession` from `@/hooks/use-auth`
 * previously got a lightweight object; now we just surface the same useAuth data.
 */
export function useSession() {
  const { user, isLoading, isAuthenticated } = useAuth()
  // `checked` should only be true when we have actually resolved the auth
  // state. If the cache was seeded from SSR we consider it checked
  // immediately. Otherwise, we must wait for `hasFetchedUser` to be true
  // (set after the profile fetch completes or returns 401). Falling back to
  // `!isLoading` alone can cause a premature `checked=true` on auth pages
  // where no fetch runs, so we explicitly include `isSeeded`.
  const checked = hasFetchedUser || isSeeded || !!user
  return {
    user,
    isLoggedIn: isAuthenticated,
    isLoading,
    checked,
  }
}
