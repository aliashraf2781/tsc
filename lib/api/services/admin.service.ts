// lib/api/services/admin.service.ts
import { api, ApiError } from "../client"
import type { ApiResponse, Job, JobApplication, User, PaginationMeta } from "../types"
import {
  normalizeCompanyApplication,
  hasValidApplicantName,
  type CompanyApplication,
} from "@/features/company-jobs/lib/application-utils"
import {
  extractUserUuid,
  isUuidRouteId,
  resolveUserRouteId,
} from "@/lib/api/resolve-user-route-id"
import { enrichMissingApplicantNames } from "@/lib/api/services/application-enrichment.service"

async function enrichAdminApplication(
  application: JobApplication,
  token: string,
  locale: string
): Promise<JobApplication> {
  const userId = application.user_id || application.user?.id
  if (!userId) return application

  const needsUser =
    !hasValidApplicantName(application as CompanyApplication) ||
    !application.user?.email
  const portfolioRecord = (application as CompanyApplication).userPortfolio
  const needsPortfolio = !portfolioRecord || Object.keys(portfolioRecord).length === 0

  if (!needsUser && !needsPortfolio) return application

  const [user, portfolio] = await Promise.all([
    needsUser ? getAdminUserById(userId, token, locale) : Promise.resolve(null),
    needsPortfolio ? getAdminUserPortfolio(userId, token, locale) : Promise.resolve(null),
  ])

  return normalizeCompanyApplication({
    ...application,
    user_id: userId,
    user: user ? { ...(application.user || {}), ...user } : application.user,
    userPortfolio: portfolio || portfolioRecord,
    portfolio: portfolio || application.portfolio,
  }) as JobApplication
}

const ADMIN_JOB_STATUSES = ["pending", "approved", "active", "rejected"] as const

export async function getAdminJobs(
  token: string,
  status?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  const query = status ? `?status=${status}&page=${page}` : `?page=${page}`
  const response = await api.get<unknown>(`/admin/jobs${query}`, { token, locale, next: { revalidate: 15 } })

  const typed = response as
    | { data?: unknown[]; meta?: PaginationMeta }
    | unknown[]
    | undefined

  const rawList = Array.isArray(typed)
    ? typed
    : Array.isArray(typed?.data)
      ? (typed!.data as unknown[])
      : []

  const data = (Array.isArray(rawList) ? rawList : [])
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as Record<string, any>
      const id = Number(row.id)
      if (!Number.isFinite(id) || id <= 0) return null
      return { ...(row as Record<string, any>), id } as Job
    })
    .filter((item): item is Job => item !== null)

  const meta: PaginationMeta = Array.isArray(typed)
    ? { current_page: page, last_page: 1, per_page: data.length, total: data.length }
    : typed?.meta || { current_page: page, last_page: 1, per_page: data.length, total: data.length }

  return { data, meta }
}

export async function getAdminUserPortfolio(
  userId: number | string,
  token: string,
  locale = "ar"
): Promise<any | null> {
  try {
    const response = await api.get<any>(`/users/${userId}/portfolio`, { token, locale })
    return response.data ?? response
  } catch (err) {
    try {
      const response = await api.get<any>(`/portfolio/${userId}`, { token, locale })
      return response.data ?? response
    } catch (innerErr) {
      return null
    }
  }
}

async function findAdminApplicationInList(
  jobId: number,
  applicationId: number,
  token: string,
  locale: string
): Promise<JobApplication | null> {
  let page = 1
  while (true) {
    const { data, meta } = await getAdminJobApplications(jobId, token, page, locale)
    const found = data.find((a) => Number(a.id) === Number(applicationId))
    if (found) {
      if (found.user_id && !found.user) {
        const user = await getAdminUserById(found.user_id, token, locale)
        if (user) {
          found.user = user
        }
      }
      if (!found.portfolio && (found.user_id || found.user?.id)) {
        const portfolio = await getAdminUserPortfolio(found.user_id || found.user?.id, token, locale)
        if (portfolio) {
          found.portfolio = portfolio
        }
      }
      return found
    }
    const last = Number(meta?.last_page ?? 1)
    if (page >= last) break
    page += 1
  }
  return null
}

export async function getAdminJobApplicationById(
  jobId: number,
  applicationId: number,
  token: string,
  locale = "ar"
): Promise<JobApplication | null> {
  try {
    const response = await api.get<unknown>(`/admin/job-applications/${applicationId}`, { token, locale })
    const raw = ((response as { data?: unknown })?.data ?? response) as Record<string, unknown> | undefined
    if (!raw) return null

    // The single-application endpoint returns `applicationId`/`appliedAt`/`jobDetails`
    // (no `job`/`user` keys) — normalizeCompanyApplication maps `jobDetails` onto the
    // shared `Job` shape automatically.
    const normalized = normalizeCompanyApplication(raw) as JobApplication
    const enriched = await enrichAdminApplication(normalized, token, locale)

    // This endpoint never returns applicant identity (no user/user_id), so
    // recover it from the paginated applications list, which does.
    if (!enriched.user_id && !enriched.user?.id) {
      const fromList = await findAdminApplicationInList(jobId, applicationId, token, locale).catch(() => null)
      if (fromList) {
        return {
          ...enriched,
          user_id: fromList.user_id ?? enriched.user_id,
          user: fromList.user ?? enriched.user,
          portfolio: fromList.portfolio ?? enriched.portfolio,
        }
      }
    }

    return enriched
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 401 || err.status === 404)) {
      return findAdminApplicationInList(jobId, applicationId, token, locale).catch(() => null)
    }
    return null
  }
}

export async function getAdminJobById(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<Job | null> {
  // Postman exposes GET /public/jobs/:id — not /admin/jobs/:id
  try {
    const { getPublicJobDetail } = await import("./jobs.service")
    const detail = await getPublicJobDetail(jobId, locale)
    if (detail?.job) return detail.job
  } catch {
    // fall through
  }

  // Fast fallback: scan unfiltered admin list (max 3 pages)
  try {
    for (let page = 1; page <= 3; page++) {
      const { data, meta } = await getAdminJobs(token, undefined, page, locale)
      const job = data.find((entry) => entry.id === jobId)
      if (job) return job
      if (page >= (meta?.last_page ?? 1)) break
    }
  } catch {
    // ignore
  }

  return null
}

export async function getAdminJobApplications(
  jobId: number,
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
  try {
    const response = await api.get<unknown>(
      `/admin/job-applications?job_id=${jobId}&page=${page}`,
      { token, locale }
    )

    const typedResponse = response as
      | { data?: JobApplication[]; meta?: PaginationMeta }
      | JobApplication[]
      | undefined

    const rawList = Array.isArray(typedResponse)
      ? typedResponse
      : Array.isArray(typedResponse?.data)
        ? typedResponse.data
        : []

    const data = await enrichMissingApplicantNames(
      rawList.map((item) => normalizeCompanyApplication(item) as unknown as JobApplication) as CompanyApplication[],
      token,
      locale
    ) as JobApplication[]

    const meta = Array.isArray(typedResponse)
      ? {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: data.length,
        }
      : typedResponse?.meta || {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: data.length,
        }

    return { data, meta }
  } catch (error) {
    throw error
  }
}

export async function approveJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<Job> {
  const response = await api.patch<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/approve`,
    {},
    { token, locale }
  )
  return response.data
}

export async function rejectJob(
  jobId: number,
  token: string,
  locale = "ar",
  reason?: string
): Promise<Job> {
  const response = await api.patch<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/reject`,
    reason ? { reason } : {},
    { token, locale }
  )
  return response.data
}

type AdminJobMutation = {
  method: "delete" | "patch" | "post"
  path: string
  body?: FormData | Record<string, unknown>
}

async function runAdminJobMutation(
  attempts: AdminJobMutation[],
  token: string,
  locale: string,
  fallbackMessage: string
): Promise<void> {
  let lastError: ApiError | null = null

  for (const attempt of attempts) {
    try {
      if (attempt.method === "delete") {
        await api.delete(attempt.path, { token, locale })
      } else if (attempt.method === "patch") {
        await api.patch(attempt.path, attempt.body ?? {}, { token, locale })
      } else {
        await api.post(attempt.path, attempt.body, { token, locale })
      }
      return
    } catch (err) {
      if (err instanceof ApiError) {
        lastError = err
        if (err.status === 404 || err.status === 405) continue
      }
    }
  }

  if (lastError) throw lastError
  throw new ApiError(400, fallbackMessage)
}

export async function deleteAdminJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await runAdminJobMutation(
    [
      { method: "delete", path: `/admin/jobs/${jobId}` },
      { method: "delete", path: `/jobs/${jobId}` },
      { method: "delete", path: `/company/jobs/${jobId}` },
    ],
    token,
    locale,
    "Failed to delete job"
  )
}

export async function stopAdminJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await runAdminJobMutation(
    [
      { method: "patch", path: `/admin/jobs/${jobId}/stop` },
      { method: "patch", path: `/jobs/${jobId}/stop` },
      { method: "patch", path: `/company/jobs/${jobId}/stop` },
    ],
    token,
    locale,
    "Failed to stop job"
  )
}

export async function activateAdminJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  const formActive = new FormData()
  formActive.append("status", "active")
  const formApproved = new FormData()
  formApproved.append("status", "approved")

  await runAdminJobMutation(
    [
      { method: "patch", path: `/admin/jobs/${jobId}/approve` },
      { method: "post", path: `/jobs/${jobId}`, body: formActive },
      { method: "post", path: `/jobs/${jobId}`, body: formApproved },
      { method: "post", path: `/company/jobs/${jobId}`, body: formActive },
    ],
    token,
    locale,
    "Failed to activate job"
  )
}

export async function createAdminJob(
  formData: FormData,
  token: string,
  locale = "ar"
): Promise<Job> {
  const response = await api.post<ApiResponse<Job>>("/admin/jobs", formData, { token, locale })
  const payload = (response as any)?.data ?? response
  return payload as Job
}

async function resolveUserApiRouteId(
  userId: number | string | { id?: number | string; uuid?: string | null },
  token: string,
  locale: string
): Promise<string> {
  const direct = resolveUserRouteId(userId)
  if (isUuidRouteId(direct)) return direct

  if (typeof userId === "object" && userId?.uuid) {
    return resolveUserRouteId(userId)
  }

  const numericId = typeof userId === "object" ? userId.id : userId
  if (numericId == null) return direct

  for (const role of ["user", "company", undefined] as const) {
    try {
      const { data } = await getAdminUsers(token, role, 1, locale, 100)
      const found = data.find(
        (entry) => String(entry.id) === String(numericId) || entry.uuid === String(numericId)
      )
      if (found?.uuid) return found.uuid
    } catch {
      // try next role filter
    }
  }

  return direct
}

export async function deleteUser(
  userId: number | string | { id?: number | string; uuid?: string | null },
  token: string,
  locale = "ar"
): Promise<void> {
  const routeId = await resolveUserApiRouteId(userId, token, locale)
  await api.delete(`/users/${routeId}`, { token, locale })
}

export async function getAdminUserById(
  userId: number | string,
  token: string,
  locale = "ar"
): Promise<User | null> {
  try {
    const tryEndpoints = [
      { method: "get", path: `/admin/users/${userId}` },
      { method: "get", path: `/users/${userId}` },
      { method: "post", path: `/users/${userId}` },
    ] as const

    for (const e of tryEndpoints) {
      try {
        let response: unknown = null
        if (e.method === "get") {
          response = await api.get<unknown>(e.path, { token, locale })
        } else {
          response = await api.post<unknown>(e.path, {}, { token, locale })
        }

        if (!response || typeof response !== "object") continue
        const root = response as Record<string, unknown>
        const item = (root.data ?? response) as any
        if (item) return item as User
      } catch (innerErr) {
        continue
      }
    }

    return null
  } catch (err) {
    console.error("[getAdminUserById] error:", err)
    return null
  }
}

export async function getAdminJobApplicationStats(
  token: string,
  locale = "ar"
): Promise<{ total?: number; pending?: number; approved?: number; rejected?: number }> {
  try {
    const response = await api.get<
      ApiResponse<{ total?: number; pending?: number; approved?: number; rejected?: number }>
    >("/admin/job-applications/stats", { token, locale })
    return response.data
  } catch (err) {
    return {}
  }
}

export async function getAdminUsers(
  token: string,
  role?: string,
  page = 1,
  locale = "ar",
  perPage = 10
): Promise<{ data: User[]; meta: PaginationMeta }> {
  let query = `page=${page}&per_page=${perPage}`
  if (role) {
    const backendRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    query += `&filter[roles.name]=${backendRole}`
  }

  const response = await api.get<any>(`/users?${query}`, { token, locale })
  
  const rawList = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : []

  const data = rawList.map((item: unknown) => {
    const row = item as Record<string, unknown>
    const user = row as unknown as User
    return {
      ...user,
      uuid: extractUserUuid(row) ?? user.uuid,
    }
  }) as User[]
  
  const meta: PaginationMeta = Array.isArray(response)
    ? { current_page: page, last_page: 1, per_page: perPage, total: data.length }
    : response?.meta || { current_page: page, last_page: 1, per_page: perPage, total: data.length }

  return { data, meta }
}

export async function getAdminUserStats(
  token: string,
  locale = "ar",
  role: string = "user"
): Promise<{ total: number; verified: number; unverified: number }> {
  const perPage = 100
  const first = await getAdminUsers(token, role, 1, locale, perPage)
  const lastPage = Math.max(first.meta?.last_page ?? 1, 1)

  let allUsers = first.data
  if (lastPage > 1) {
    const remainingPages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2)
    const rest = await Promise.all(
      remainingPages.map((page) =>
        getAdminUsers(token, role, page, locale, perPage).catch(() => ({ data: [] as User[] }))
      )
    )
    allUsers = allUsers.concat(...rest.map((r) => r.data))
  }

  const verified = allUsers.filter((u) => u.emailVerified).length
  const total = first.meta?.total ?? allUsers.length

  return { total, verified, unverified: allUsers.length - verified }
}

export async function getAdminStats(
  token: string,
  locale = "ar"
): Promise<{
  total_users: number
  total_companies: number
  total_jobs: number
  pending_jobs: number
  published_jobs?: number
}> {
  try {
    const [usersResult, companiesResult] = await Promise.all([
      getAdminUsers(token, "user", 1, locale, 1),
      getAdminUsers(token, "company", 1, locale, 1),
    ])

    const totalUsers = usersResult.meta?.total ?? 0
    const totalCompanies = companiesResult.meta?.total ?? 0

    let totalJobs = 0
    let pendingJobs = 0

    try {
      const allJobs = await getAdminJobs(token, undefined, 1, locale).catch(() => ({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } }))
      totalJobs = allJobs.meta?.total ?? 0
    } catch (e) {
      totalJobs = 0
    }

    try {
      const pendingRes = await getAdminJobs(token, "pending", 1, locale).catch(() => ({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } }))
      pendingJobs = pendingRes.meta?.total ?? 0
    } catch (e) {
      pendingJobs = 0
    }

    let publishedJobs = 0
    try {
      const [approvedRes, activeRes] = await Promise.all([
        getAdminJobs(token, "approved", 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
        getAdminJobs(token, "active", 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
      ])
      publishedJobs = (approvedRes.meta?.total ?? 0) + (activeRes.meta?.total ?? 0)
    } catch (e) {
      publishedJobs = Math.max(0, (totalJobs || 0) - (pendingJobs || 0))
    }

    if (!totalJobs) {
      try {
        const jobStatuses = ["pending", "approved", "active", "rejected"] as const
        const jobResults = await Promise.all(jobStatuses.map((status) => getAdminJobs(token, status, 1, locale).catch(() => ({ data: [], meta: { total: 0 } }))))
        totalJobs = jobResults.reduce((sum, result) => sum + (result.meta?.total ?? 0), 0)
      } catch {
        // ignore
      }
    }

    return {
      total_users: Number(totalUsers || 0),
      total_companies: Number(totalCompanies || 0),
      total_jobs: Number(totalJobs || 0),
      pending_jobs: Number(pendingJobs || 0),
      published_jobs: Number(publishedJobs || 0),
    }
  } catch (err) {
    return { total_users: 0, total_companies: 0, total_jobs: 0, pending_jobs: 0 }
  }
}

export async function suspendUser(
  userId: number | string | { id?: number | string; uuid?: string | null },
  suspend: boolean,
  token: string,
  locale = "ar"
): Promise<void> {
  const routeId = await resolveUserApiRouteId(userId, token, locale)
  const formData = new FormData()
  formData.append("status", suspend ? "suspended" : "active")
  await api.post(`/users/${routeId}`, formData, { token, locale })
}

export async function updateAdminUser(
  userId: number | string | { id?: number | string; uuid?: string | null },
  data: { name?: string; email?: string; password?: string; status?: string; email_verified?: number | boolean },
  token: string,
  locale = "ar"
): Promise<void> {
  const routeId = await resolveUserApiRouteId(userId, token, locale)
  const formData = new FormData()
  if (data.name) formData.append("name", data.name)
  if (data.email) formData.append("email", data.email)
  if (data.password) formData.append("password", data.password)
  if (data.status) formData.append("status", data.status)
  if (data.email_verified !== undefined) {
    formData.append("email_verified", data.email_verified ? "1" : "0")
  }

  await api.post(`/users/${routeId}`, formData, { token, locale })
}