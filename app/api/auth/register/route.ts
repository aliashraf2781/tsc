// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { register as registerService } from "@/lib/api/services/auth.service"
import { normalizeRole } from "@/lib/auth-token"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    // Parse body — signUp sends JSON; fallback to formData for other clients
    let body: Record<string, unknown> = {}
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      try { body = await request.json() } catch {}
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      try {
        const form = await request.formData()
        form.forEach((v, k) => { body[k] = typeof v === "string" ? v : v })
      } catch {}
    } else {
      // Try JSON first, then form
      try { body = await request.json() } catch {
        try {
          const form = await request.formData()
          form.forEach((v, k) => { body[k] = typeof v === "string" ? v : v })
        } catch {}
      }
    }

    const accept = body.accept_terms_and_privacy
    const payload = {
      name: String((body.name as string) || "").trim(),
      email: String((body.email as string) || "").trim(),
      phone: String((body.phone as string) || "").trim(),
      password: String((body.password as string) || ""),
      password_confirmation: String((body.password_confirmation as string) || (body.passwordConfirmation as string) || ""),
      type: (body.type as "user" | "company" | "admin") || "user",
      company_name: (body.company_name as string) || (body.companyName as string) || undefined,
      country_id: body.country_id ? Number(body.country_id) : 3,
      accept_terms_and_privacy: accept === false || accept === "0" || accept === "false" ? false : Boolean(accept ?? true),
    }

    const { user, tokens } = await registerService(payload as any, locale).catch(async (err: any) => {
      // Some backends return 422/403 with email_not_verified even on register
      const msg = String(err?.message || "")
      const isUnverified =
        msg.toLowerCase().includes("not verified") ||
        msg.toLowerCase().includes("verify") ||
        msg.toLowerCase().includes("email_not_verified") ||
        err?.status === 403
      if (isUnverified) {
        return { user: null, tokens: null, pendingVerification: true }
      }
      throw err
    }) as any

    // If registration requires email verification
    if ((tokens as any)?.pendingVerification || (user === null && (tokens as any) === null)) {
      return NextResponse.json({ pendingVerification: true, email: payload.email }, { status: 200 })
    }

    const at = ((tokens as any)?.access_token || (tokens as any)?.accessToken || (tokens as any)?.token) as string | undefined
    if (!user) return NextResponse.json({ message: "بيانات المستخدم غير موجودة في الرد" }, { status: 500 })
    let fullUser = user
    if (at) {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://dashboardtalent.talent-sc.de/api/v1"
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 1000) // 1s timeout to avoid long blocking
        try {
          const profileRes = await fetch(`${BACKEND_URL}/auth/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${at}`,
              'Accept-Language': locale,
              'Accept': 'application/json',
            },
            cache: 'no-store',
            signal: controller.signal,
          })
          if (profileRes.ok) {
            const profileData = await profileRes.json().catch(() => null)
            if (profileData?.data || profileData) {
              fullUser = profileData.data || profileData
            }
          }
        } finally {
          clearTimeout(timeout)
        }
      } catch (err) {
        console.error("Failed to fetch profile in register route (timed or errored):", err)
      }
      // If profile indicates the user is not verified, prompt client to verify
      try {
        let isEmailVerified = true
        if (fullUser) {
          if (typeof fullUser.emailVerified === 'boolean') {
            isEmailVerified = fullUser.emailVerified
          } else if (fullUser.email_verified_at !== undefined) {
            isEmailVerified = Boolean(fullUser.email_verified_at)
          } else if (typeof fullUser.email_verified === 'boolean') {
            isEmailVerified = fullUser.email_verified
          } else if (fullUser.status && (fullUser.status === 'pending' || fullUser.status === 'inactive')) {
            isEmailVerified = false
          }
        }
        if (!isEmailVerified) {
          return NextResponse.json({ pendingVerification: true, email: payload.email }, { status: 200 })
        }
      } catch {}
    }

    const canonicalRole = normalizeRole(fullUser)
    const normalizedUser = {
      ...fullUser,
      role: canonicalRole,
    }

    const res = NextResponse.json({ user: normalizedUser, tokens }, { status: 201 })

    // Persist access token as an httpOnly cookie for server-side requests
    try {
      const at = ((tokens as any)?.access_token || (tokens as any)?.accessToken || (tokens as any)?.token) as string | undefined
      if (at) {
        res.cookies.set("access_token", String(at), {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
        if (normalizedUser && normalizedUser.role) {
          res.cookies.set("user_role", String(normalizedUser.role), {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          })
        }
      }
    } catch {}

    return res
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "حدث خطأ في الخادم"
    const errors = error instanceof ApiError ? error.errors : undefined

    return NextResponse.json({ message, errors }, { status })
  }
}

