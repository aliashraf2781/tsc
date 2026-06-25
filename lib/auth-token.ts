import { NextRequest, NextResponse } from "next/server"
import { cache } from "react"
import { API_BASE_URL } from "@/lib/api/config"

export const TOKEN_COOKIE = 'access_token'
export const ROLE_COOKIE = 'user_role'
export const USER_META_COOKIE = 'user_meta'

const BACKEND_URL = API_BASE_URL

export type UserMetaSnapshot = {
  id: number
  name: string
  email: string
}

function decodeCookieValue(value: string | undefined | null): string | null {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export interface SessionData {
  isLoggedIn: boolean
  accessToken: string | null
  locale?: string
  role?: "user" | "company" | "admin" | null
  user?: {
    id: number
    name: string
    email: string
    role: "user" | "company" | "admin"
    avatar?: string
    company?: any
    company_profile?: any
    companyProfile?: any
  } | null
}

// Server-side: read token from cookies() [Next.js server component]
export async function getTokenFromCookie(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers")
    const cs = await cookies()
    return decodeCookieValue(cs.get(TOKEN_COOKIE)?.value)
  } catch {
    return null
  }
}

export async function getRoleFromCookie(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers")
    const cs = await cookies()
    return cs.get(ROLE_COOKIE)?.value || null
  } catch {
    return null
  }
}

// Middleware/Route Handler: read from NextRequest
export function getTokenFromRequest(req: NextRequest): string | null {
  return decodeCookieValue(req.cookies.get(TOKEN_COOKIE)?.value)
}

export function getRoleFromRequest(req: NextRequest): string | null {
  return req.cookies.get(ROLE_COOKIE)?.value || null
}

// After login: set HttpOnly cookie on NextResponse
export function setAuthCookies(
  res: NextResponse,
  token: string,
  role: string,
  userMeta?: UserMetaSnapshot
): NextResponse {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Use 'lax' during development to avoid sameSite blocking when ports
    // differ (dev servers may run on 3000/3001). Keep 'strict' in production.
    sameSite: process.env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
    maxAge: 60 * 60 * 24 * 7,   // 7 days
    path: '/'
  }
  res.cookies.set(TOKEN_COOKIE, token, options)
  res.cookies.set(ROLE_COOKIE, role, options)
  if (userMeta?.id) {
    res.cookies.set(USER_META_COOKIE, JSON.stringify(userMeta), options)
  }
  return res
}

// On logout or 401: clear cookies
export function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set(TOKEN_COOKIE, '', { path: '/', maxAge: 0 })
  res.cookies.set(ROLE_COOKIE, '', { path: '/', maxAge: 0 })
  res.cookies.set(USER_META_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}

// Compatibility helper: clearRefreshCookie
export function clearRefreshCookie(body: unknown = { success: true }, status = 200) {
  const res = NextResponse.json(body, { status })
  return clearAuthCookies(res)
}

// Compatibility helper: normalizeRole
export function normalizeRole(roleInput: unknown): "user" | "company" | "admin" {
  if (!roleInput) return "user"

  // If caller passed a simple string role, handle quickly
  if (typeof roleInput === 'string') {
    const s = roleInput.toLowerCase()
    if (s.includes('admin')) return 'admin'
    if (s.includes('company') || s.includes('employer')) return 'company'
    return 'user'
  }

  // If an object was passed, prefer explicit role fields instead of
  // stringifying the whole object (which can contain unrelated values
  // like company names that falsely match).
  try {
    const obj = roleInput as Record<string, unknown>
    const candidates: string[] = []

    if (obj == null || typeof obj !== 'object') return 'user'

    if (typeof obj.role === 'string') candidates.push(obj.role)
    if (typeof obj.type === 'string') candidates.push(obj.type)
    if (typeof obj.name === 'string') candidates.push(obj.name)

    if (obj.roles) {
      if (Array.isArray(obj.roles)) {
        for (const r of obj.roles) {
          if (typeof r === 'string') candidates.push(r)
          else if (r && typeof r.name === 'string') candidates.push(r.name)
        }
      } else if (typeof obj.roles === 'string') {
        candidates.push(obj.roles)
      } else if (typeof obj.roles === 'object' && obj.roles !== null) {
        const rolesObj = obj.roles as Record<string, unknown>
        if (typeof rolesObj.name === 'string') candidates.push(rolesObj.name)
      }
    }

    for (const c of candidates) {
      const s = String(c || '').toLowerCase()
      if (s.includes('admin')) return 'admin'
      if (s.includes('company') || s.includes('employer')) return 'company'
    }
  } catch {
    // ignore and fallthrough to user
  }

  return 'user'
}

async function readUserMetaFromCookie(): Promise<UserMetaSnapshot | null> {
  try {
    const { cookies } = await import("next/headers")
    const cs = await cookies()
    const raw = cs.get(USER_META_COOKIE)?.value
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserMetaSnapshot
    if (typeof parsed?.id === "number" && parsed.id > 0) return parsed
  } catch {
    // ignore
  }
  return null
}

function buildFallbackSession(token: string, role: "user" | "company" | "admin", meta: UserMetaSnapshot | null): SessionData {
  if (meta) {
    return {
      isLoggedIn: true,
      accessToken: token,
      role,
      user: {
        id: meta.id,
        name: meta.name || "",
        email: meta.email || "",
        role,
      },
    }
  }

  return {
    isLoggedIn: true,
    accessToken: token,
    role,
    user: null,
  }
}

// Compatibility helper: getSession
export const getSession = cache(async (): Promise<SessionData> => {
  const token = await getTokenFromCookie()
  
  if (!token) {
    return { isLoggedIn: false, accessToken: null, user: null, role: null }
  }

  const roleFromCookie = normalizeRole(await getRoleFromCookie())
  const userMeta = await readUserMetaFromCookie()

  try {
    let acceptLang = 'ar'
    try {
      const { headers } = await import('next/headers')
      const h = await headers()
      acceptLang = h.get('accept-language')?.split(',')[0] || acceptLang
    } catch {}

    const { data: profile, error, status } = await callBackend<Record<string, unknown>>('/auth/profile', { method: 'GET', headers: { 'Accept-Language': acceptLang } }, token)

    if (status === 401) {
      return { isLoggedIn: false, accessToken: null, user: null, role: null }
    }

    if (!error && profile) {
        const userRaw = (profile && (profile.data || profile)) || null
        if (userRaw) {
          const ur = userRaw as unknown as { id?: number; name?: string; username?: string; email?: string; avatar?: string; avatar_url?: string; role?: string }

          if (typeof ur.id === 'number' && !Number.isNaN(ur.id) && ur.id > 0) {
            const r = normalizeRole(ur)
            const cp = (ur as any).companyProfile || (ur as any).company_profile || (ur as any).company
            const companyLogo = cp ? (cp.logoUrl || cp.logo || cp.logo_url || cp.avatar || cp.avatar_url) : undefined
            const resolvedAvatar = (r === 'company' && companyLogo) ? companyLogo : (ur.avatar || ur.avatar_url || undefined)

            return {
              isLoggedIn: true,
              accessToken: token,
              role: r,
              user: {
                id: ur.id,
                name: ur.name || ur.username || "",
                email: ur.email || "",
                role: r,
                avatar: resolvedAvatar,
                company: (ur as any).company || undefined,
                company_profile: (ur as any).company_profile || undefined,
                companyProfile: (ur as any).companyProfile || undefined,
              }
            }
          }
        }
    }

    // Transient upstream/network failure: keep session using cookie snapshot.
    if (status === 0 || error) {
      return buildFallbackSession(token, roleFromCookie, userMeta)
    }
  } catch {
    return buildFallbackSession(token, roleFromCookie, userMeta)
  }

  return { isLoggedIn: false, accessToken: null, user: null, role: null }
})

// Compatibility helper: getCanonicalRole
export async function getCanonicalRole(session: SessionData | undefined): Promise<"user" | "company" | "admin"> {
  if (session?.user?.role) return normalizeRole(session.user.role)
  const role = await getRoleFromCookie()
  return normalizeRole(role)
}

// Generic backend caller (server-side only)
export async function callBackend<T>(
  path: string, 
  options: RequestInit, 
  token?: string
): Promise<{data: T|null, error: string|null, status: number}> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Ensure content type is set for JSON bodies
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const requestUrl = `${BACKEND_URL}${normalizedPath}`

  try {
    const res = await fetch(requestUrl, {
      cache: 'no-store',
      ...options,
      headers
    })

    if (res.status === 401) {
      return { data: null, error: 'UNAUTHORIZED', status: 401 }
    }

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`
      try {
        const errJson = await res.json()
        message = errJson.message || message
      } catch {}
      return { data: null, error: message, status: res.status }
    }

    const data = await res.json() as T
    return { data, error: null, status: res.status }
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'Network error', 
      status: 0 
    }
  }
}

// ── Compat helpers ─────────────────────────────────────────────────────────────

/** Return the correct dashboard root path for a given role */
export function getDashboardPath(role: string): string {
  const r = String(role).toLowerCase()
  if (r === 'admin') return '/dashboard/admin'
  if (r === 'company' || r === 'employer') return '/dashboard/company'
  return '/dashboard/user'
}

/**
 * Alias of normalizeRole for components that import resolveUserRole.
 * Accepts a user object or a raw role string.
 */
export function resolveUserRole(userOrRole: unknown, fallback?: string): "user" | "company" | "admin" {
  return normalizeRole(userOrRole ?? fallback)
}

/**
 * Server-side sign-out helper (for use in Server Components / Route Handlers).
 * Redirects to the given URL after clearing auth cookies. Since Next.js redirect()
 * throws internally, callers should `await` this only when inside a try/catch or
 * when the redirect is the last action.
 */
export async function signOut(options?: { redirectTo?: string }): Promise<void> {
  const { redirect } = await import('next/navigation')
  redirect(options?.redirectTo || '/sign-in')
}

/**
 * Stub handlers object for legacy `[...nextauth]` route files.
 * The actual auth is handled by /api/auth/login and /api/auth/logout.
 */
export const handlers = {
  GET: async () => new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }),
  POST: async () => new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }),
}
