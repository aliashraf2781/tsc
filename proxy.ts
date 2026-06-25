import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"
import { TOKEN_COOKIE, ROLE_COOKIE } from "@/lib/auth-token"
import createMiddleware from "next-intl/middleware"

const intlMiddleware = createMiddleware(routing)

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/terms",
  "/privacy",
  "/faqs",
  "/contact",
  "/about",
  "/services",
  "/jobs",
  "/news",
]

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(?:ar|en|de)(?:\/|$)/, "/")
}

function isPublicPath(pathname: string): boolean {
  const bare = stripLocale(pathname).toLowerCase()
  if (bare === "/") return true
  return PUBLIC_PATHS.some((p) => p !== "/" && bare.startsWith(p))
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pass API routes through without intervention
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Run i18n middleware first
  const intlResponse = intlMiddleware(request)
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const urlLocale = localeMatch?.[1] || routing.defaultLocale
  const bare = stripLocale(pathname)
  const bareLower = bare.toLowerCase()

  // Read cookies directly
  const token = request.cookies.get(TOKEN_COOKIE)?.value
  const role = request.cookies.get(ROLE_COOKIE)?.value

  // Protect dashboard routes
  if (bareLower.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/${urlLocale}/sign-in`, request.url))
    }
  }

  // Protect admin-only dashboard routes
  if (bareLower.startsWith("/dashboard/admin")) {
    const normalizedRole = String(role || '').toLowerCase()
    if (normalizedRole !== 'admin') {
      return NextResponse.redirect(new URL(`/${urlLocale}/dashboard`, request.url))
    }
  }

  // Protect company-only dashboard routes
  if (bareLower.startsWith("/dashboard/company")) {
    const normalizedRole = String(role || '').toLowerCase()
    if (normalizedRole !== 'company' && normalizedRole !== 'employer') {
      return NextResponse.redirect(new URL(`/${urlLocale}/dashboard`, request.url))
    }
  }

  // Protect user-only dashboard routes
  if (bareLower.startsWith("/dashboard/user")) {
    const normalizedRole = String(role || '').toLowerCase()
    if (normalizedRole !== 'user') {
      return NextResponse.redirect(new URL(`/${urlLocale}/dashboard`, request.url))
    }
  }

  // Security headers
  intlResponse.headers.set("X-Content-Type-Options", "nosniff")
  intlResponse.headers.set("X-Frame-Options", "DENY")
  intlResponse.headers.set("X-XSS-Protection", "1; mode=block")
  intlResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  if (!isPublicPath(pathname)) {
    intlResponse.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
  }

  return intlResponse
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}