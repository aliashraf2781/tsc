// lib/api/services/auth.service.ts
import { api } from "../client"
import { resolveUserRole } from "@/lib/auth-token"
import type { ApiResponse, User, AuthTokens, Country, City, CompanyType } from "../types"

function normalizeCompanyName(value: unknown, locale = "ar") {
  if (typeof value !== "string" || value.trim() === "") return value
  return {
    [locale]: value,
    en: value,
    ar: value,
    de: value,
  }
}

function appendFormValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return
  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => appendFormValue(formData, `${key}[]`, item))
    return
  }
  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
      appendFormValue(formData, `${key}[${nestedKey}]`, nestedValue)
    })
    return
  }
  formData.append(key, String(value))
}

// Coalesce concurrent getProfile requests for the same token+locale so that
// multiple callers during the same render/navigation reuse the same
// in-flight promise and avoid duplicate upstream requests.
const inFlightProfileRequests = new Map<string, Promise<User>>()

export async function login(
  email: string,
  password: string,
  type: "user" | "company" | "admin" = "user",
  locale = "ar"
): Promise<{ user: User; tokens: AuthTokens }> {
  // Browser: call the local Next.js route so that the refresh cookie can be set
  if (typeof window !== "undefined") {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": locale,
      },
      body: JSON.stringify({ email, password, type }),
      cache: "no-store",
    })

    const data = (await response.json().catch(() => ({}))) as {
      user?: User
      tokens?: AuthTokens
      message?: string
      errors?: Record<string, string[]>
    }

    if (!response.ok) {
      throw new Error(data.message || "فشل تسجيل الدخول")
    }

    const user = data.user
    const tokens = data.tokens

    if (!user || !tokens?.access_token) throw new Error("بيانات المستخدم غير موجودة في الرد")

    return {
      user: { ...user, role: resolveUserRole(user, type) },
      tokens,
    }
  }

  // Server: call upstream directly
  const formData = new FormData()
  formData.append("email", email)
  formData.append("password", password)
  formData.append("type", type)

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/auth/login", formData, { locale })
  // Normalize response shapes: some upstream endpoints return { data: {...} }
  const data = (response && typeof response === "object" && "data" in (response as any)) ? (response as any).data : response
  // helper to read numeric expiry values from different naming conventions
  function readExpiry(obj: Record<string, unknown> | undefined, keys: string[]) {
    if (!obj) return undefined
    for (const k of keys) {
      const v = obj[k as keyof typeof obj]
      if (v !== undefined && v !== null) {
        const n = Number(v)
        if (!Number.isNaN(n)) return n
      }
    }
    return undefined
  }
  // Server-side: if tokens missing, log a redacted sample to help debugging
  try {
    const sample = JSON.stringify(data || {})
    const redactedSample = sample.replace(/("?(?:access_token|refresh_token|id_token|token|accessToken|refreshToken)"?\s*:\s*)"([^"]*)"/gi, '$1"[REDACTED]"')
    const hasTokenField = (obj: any) => {
      if (!obj) return false
      return (
        !!obj.access_token ||
        !!obj.accessToken ||
        !!obj.token ||
        !!obj.refresh_token ||
        !!obj.refreshToken
      )
    }

    const hasAnyToken = hasTokenField(data) || hasTokenField((data && data.tokens) || {})
    if (!data || !hasAnyToken) {
      // eslint-disable-next-line no-console
      console.warn(`[auth.service] login: upstream response missing tokens. Sample: ${redactedSample}`)
    }
  } catch {}
  const user = (data && (data.user as User | undefined)) || (data && data.id ? (data as unknown as User) : null)
  const tokens = (data && (data.tokens as Record<string, unknown> | undefined)) ?? {}

  if (!user) throw new Error("بيانات المستخدم غير موجودة في الرد")

  const access_token =
    (data.access_token as string | undefined) ||
    (data.token as string | undefined) ||
    (data.accessToken as string | undefined) ||
    (tokens.access_token as string | undefined) ||
    ""

  const refresh_token =
    (data.refresh_token as string | undefined) ||
    (data.refreshToken as string | undefined) ||
    (tokens.refresh_token as string | undefined) ||
    ""

  const token_type =
    (data.token_type as string | undefined) ||
    (data.tokenType as string | undefined) ||
    (tokens.token_type as string | undefined) ||
    "Bearer"

  // Try multiple possible fields (`accessExpiresIn`, `expiresIn`, `expires_in`, etc.)
  const expiresCandidates = readExpiry(data as Record<string, unknown>, [
    "accessExpiresIn",
    "access_expires_in",
    "access_expires",
    "expiresIn",
    "expires_in",
    "access_expires_in",
  ])
  const tokenExpiresCandidates = expiresCandidates ?? readExpiry(tokens as Record<string, unknown>, ["expires_in", "expiresIn", "accessExpiresIn", "access_expires_in"])
  const expires_in = tokenExpiresCandidates ?? 3600 * 2

  return {
    user: { ...user, role: resolveUserRole(user, type) },
    tokens: {
      access_token,
      refresh_token,
      token_type: token_type as "Bearer",
      expires_in,
    },
  }
}

export type RegisterPayload = {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  type: "user" | "company"
  company_name?: string
  country_id?: number
  accept_terms_and_privacy?: boolean
}

export async function register(data: RegisterPayload, locale = "ar"): Promise<{ user: User; tokens: AuthTokens }> {
  const formData = new FormData()
  formData.append("name", data.name)
  formData.append("email", data.email)
  formData.append("phone", data.phone)
  formData.append("password", data.password)
  formData.append("password_confirmation", data.password_confirmation)
  const roleLabel = data.type === "company" ? "Company" : "User"
  formData.append("roles[]", roleLabel)
  formData.append("country_id", String(data.country_id ?? 1))
  formData.append("accept_terms_and_privacy", data.accept_terms_and_privacy === false ? "0" : "1")
  if (data.company_name) appendFormValue(formData, "company_name", normalizeCompanyName(data.company_name, locale))

  const response = await api.post<ApiResponse<Record<string, unknown>>>("/auth/register", formData, { locale })
  const resData = response.data
  const user = (resData.user as User | undefined) || (resData.id ? (resData as unknown as User) : null)
  const tokens = (resData.tokens as Record<string, unknown> | undefined) ?? {}
  if (!user) throw new Error("بيانات المستخدم غير موجودة في الرد")
  const access_token =
    (resData.access_token as string | undefined) ||
    (resData.token as string | undefined) ||
    (resData.accessToken as string | undefined) ||
    (tokens.access_token as string | undefined) ||
    ""
  function readExpiry(obj: Record<string, unknown> | undefined, keys: string[]) {
    if (!obj) return undefined
    for (const k of keys) {
      const v = obj[k as keyof typeof obj]
      if (v !== undefined && v !== null) {
        const n = Number(v)
        if (!Number.isNaN(n)) return n
      }
    }
    return undefined
  }

  return {
    user: { ...user, role: resolveUserRole(user, data.type) },
    tokens: {
      access_token,
      refresh_token: (resData.refresh_token as string | undefined) || (tokens.refresh_token as string | undefined) || "",
      token_type: ((resData.token_type as string | undefined) || (tokens.token_type as string | undefined) || "Bearer") as "Bearer",
      expires_in:
        readExpiry(resData as Record<string, unknown>, ["accessExpiresIn", "access_expires_in", "expiresIn", "expires_in"]) ??
        readExpiry(tokens as Record<string, unknown>, ["expires_in", "expiresIn"]) ??
        3600 * 2,
    },
  }
}



export async function logout(token: string, locale = "ar"): Promise<void> {
  await api.post("/auth/logout", {}, { token, locale })
}

export async function forgotPassword(email: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  await api.post("/auth/forgot-password", formData, { locale })
}

export async function verifyResetCode(email: string, code: string, locale = "ar"): Promise<{ token: string }> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("code", code)
  const response = await api.post<ApiResponse<{ token: string }>>("/auth/verify-reset-code", formData, { locale })
  return response.data
}

export async function resetPassword(data: { token: string; password: string; password_confirmation: string }, locale = "ar"): Promise<void> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => formData.append(k, v))
  await api.post("/auth/reset-password", formData, { locale })
}

export async function getProfile(token?: string, locale = "ar", opts?: { requestId?: string }): Promise<User> {
  // Generate a correlation id so callers can match this call-site with
  // the outgoing request logs emitted by `fetchApi`.
  const requestId = opts?.requestId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  if (process.env.NODE_ENV !== "production") {
    console.log(`[CALL:${requestId}] getProfile { hasTokenArg: ${Boolean(token)} }`)
  }

  // Avoid duplicate parallel requests for the same token+locale.
  const inflightKey = `${token || "_anon"}:${locale}`
  if (inFlightProfileRequests.has(inflightKey)) {
    return inFlightProfileRequests.get(inflightKey) as Promise<User>
  }

  const promise = (async () => {
    try {
      const response = await api.get<ApiResponse<User>>("/auth/profile", { token, locale, timeout: 15000, requestId })
      return response.data
    } finally {
      // Clear the entry so subsequent requests refetch when necessary.
      inFlightProfileRequests.delete(inflightKey)
    }
  })()

  inFlightProfileRequests.set(inflightKey, promise)
  return promise
}

export async function resendVerification(email: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  await api.post("/auth/resend-verification", formData, { locale })
}

export async function verifyEmail(email: string, code: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("code", code)
  await api.post("/auth/verify", formData, { locale })
}

export async function updateProfile(data: Record<string, unknown>, token: string, locale = "ar"): Promise<User> {
  const formData = new FormData()
  const normalizedData = { ...data, company_name: normalizeCompanyName((data as any).company_name, locale) }
  Object.entries(normalizedData).forEach(([k, v]) => appendFormValue(formData, k, v))
  const response = await api.post<ApiResponse<User>>("/auth/profile", formData, { token, locale })
  return response.data
}

export async function uploadAvatar(file: File | Blob, token: string, locale = "ar"): Promise<User> {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await api.post<ApiResponse<User>>("/auth/profile/avatar", formData, { token, locale })
  return response.data
}

export async function deleteAvatar(token: string, locale = "ar"): Promise<void> {
  await api.delete("/auth/profile/avatar", { token, locale })
}

export async function updatePassword(current_password: string, new_password: string, new_password_confirmation: string, token: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("current_password", current_password)
  formData.append("new_password", new_password)
  formData.append("new_password_confirmation", new_password_confirmation)
  await api.post("/auth/profile/password", formData, { token, locale })
}

export async function getPreferences(token: string, locale = "ar"): Promise<unknown> {
  const response = await api.get<ApiResponse<unknown>>("/auth/profile/preferences", { token, locale })
  return response.data
}

export async function updatePreferences(data: Record<string, unknown>, token: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, String(v)) })
  await api.post("/auth/profile/preferences", formData, { token, locale })
}

function parseList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[]
  if (response && typeof response === "object") {
    const root = response as Record<string, unknown>
    if (Array.isArray(root.data)) return root.data as T[]
  }
  return []
}

export async function getCountries(locale = "ar", token?: string): Promise<Country[]> {
  const response = await api.get<unknown>("/countries", { locale, token })
  return parseList<Country>(response)
}

export async function getCities(countryId: number, locale = "ar", token?: string): Promise<City[]> {
  const response = await api.get<unknown>(`/cities/${countryId}`, { locale, token })
  return parseList<City>(response)
}

export async function getCompanyTypes(locale = "ar", token?: string): Promise<CompanyType[]> {
  const response = await api.get<unknown>("/company-types", { locale, token })
  return parseList<CompanyType>(response)
}

