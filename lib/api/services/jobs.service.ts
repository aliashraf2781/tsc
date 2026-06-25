// lib/api/services/jobs.service.ts
import { api } from "../client"
import type { ApiResponse, Job, PaginationMeta, PublicJobDetail } from "../types"

export interface JobsFilter {
  per_page?: number
  page?: number
  category_id?: number
  country_id?: number
  city_id?: number
  salary_from?: number
  salary_to?: number
  search?: string
  state?: string
}

function pickLocalizedString(value: unknown, locale = "ar"): string {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return ""

  const map = value as Record<string, unknown>
  const priority = [locale, "en", "ar", "de"]

  for (const key of priority) {
    const candidate = map[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }

  for (const candidate of Object.values(map)) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }

  return ""
}

function pickLocalizedField(
  row: Record<string, unknown>,
  field: string,
  locale = "ar"
): string | undefined {
  const direct = pickLocalizedString(row[field], locale)
  if (direct) return direct

  const priority = [`${field}_${locale}`, `${field}${locale}`]
  const fallbacks = [`${field}_ar`, `${field}_en`, `${field}_de`, `${field}ar`, `${field}en`, `${field}de`]

  for (const key of priority) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  for (const key of fallbacks) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return undefined
}

function normalizeNestedValue<T extends { name?: string }>(
  raw: unknown,
  locale: string
): T | undefined {
  if (!raw) return undefined

  let row: Record<string, unknown> | null = null
  if (typeof raw === "string") {
    try {
      row = JSON.parse(raw) as Record<string, unknown>
    } catch {
      return undefined
    }
  } else if (typeof raw === "object") {
    row = raw as Record<string, unknown>
  }

  if (!row) return undefined
  const name = pickLocalizedField(row, "name", locale) || ""
  return { ...row, name } as T
}

function extractJobsList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== "object") return []

  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data
  if (Array.isArray(obj.jobs)) return obj.jobs
  if (Array.isArray(obj.items)) return obj.items

  const data = obj.data
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>
    if (Array.isArray(nested.data)) return nested.data
    if (Array.isArray(nested.jobs)) return nested.jobs
  }

  return []
}

function readRange(
  row: Record<string, unknown>,
  flatFrom: string,
  flatTo: string,
  nestedKey: string
): { from?: number; to?: number } {
  const nested = row[nestedKey]
  if (nested && typeof nested === "object") {
    const range = nested as Record<string, unknown>
    return {
      from: range.from != null ? Number(range.from) : undefined,
      to: range.to != null ? Number(range.to) : undefined,
    }
  }
  return {
    from: row[flatFrom] != null ? Number(row[flatFrom]) : undefined,
    to: row[flatTo] != null ? Number(row[flatTo]) : undefined,
  }
}

/**
 * Parse a variety of date formats into an ISO string.
 * - numeric seconds (10-digit) or milliseconds (13+ digit)
 * - numeric string timestamps
 * - SQL style 'YYYY-MM-DD HH:MM:SS' (tries with/without 'Z')
 * - any string parseable by `new Date()`
 */
function parseDateLike(value: unknown): string | undefined {
  if (value == null) return undefined

  if (typeof value === "number") {
    // treat small numbers as seconds
    return value > 1e12 ? new Date(value).toISOString() : new Date(value * 1000).toISOString()
  }

  if (typeof value === "string") {
    const v = value.trim()
    if (!v) return undefined

    if (/^\d+$/.test(v)) {
      const num = Number(v)
      return num > 1e12 ? new Date(num).toISOString() : new Date(num * 1000).toISOString()
    }

    // handle common SQL datetime without timezone
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)) {
      const isoLike = v.replace(" ", "T")
      const d = new Date(isoLike)
      if (!Number.isNaN(d.getTime())) return d.toISOString()
      const d2 = new Date(isoLike + "Z")
      if (!Number.isNaN(d2.getTime())) return d2.toISOString()
    }

    const parsed = new Date(v)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  return undefined
}

function mapStatus(raw: unknown): Job["status"] {
  if (raw === "active") return "approved"
  if (
    raw === "pending" ||
    raw === "approved" ||
    raw === "rejected" ||
    raw === "stopped"
  ) {
    return raw
  }
  return "approved"
}

export function normalizeJob(item: unknown, _locale: string): Job | null {
  // Minimal, non-mutating pass-through normalizer.
  // The project owner requested not to modify or enrich server-provided data.
  if (!item || typeof item !== "object") return null
  const row = item as Record<string, any>
  const id = Number(row.id)
  if (!Number.isFinite(id) || id <= 0) return null

  // Return the original payload with only a safe numeric id and preserved fields.
  return {
    ...(row as Record<string, any>),
    id,
    // Preserve timestamps as provided by the server; do not synthesize values here.
    created_at: row.created_at ?? row.createdAt,
  } as Job
}

function parseJobsResponse(
  response: unknown,
  locale: string
): { data: Job[]; meta?: PaginationMeta } {
  if (!response || typeof response !== "object") {
    return { data: [] }
  }

  const root = response as Record<string, unknown>
  const meta = root.meta as PaginationMeta | undefined
  const candidates = [root.data, root, extractJobsList(root.data), extractJobsList(root)]

  for (const candidate of candidates) {
    const list = extractJobsList(candidate)
    if (list.length === 0) continue

    const data = list
      .map((item) => normalizeJob(item, locale))
      .filter((item): item is Job => item !== null)

    return { data, meta }
  }

  return { data: [], meta }
}

export async function getPublicJobs(
  filter: JobsFilter = {},
  locale = "ar"
): Promise<{ data: Job[]; meta?: PaginationMeta }> {
  const params = new URLSearchParams()
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.append(key, String(value))
  })

  const query = params.toString() ? `?${params}` : ""
  const endpoints = [`/public/jobs${query}`, `/jobs${query}`]

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<unknown>(endpoint, {
        locale,
        cache: "no-store",
        timeout: 15000, // Increase timeout for slow jobs endpoint
      })
      const parsed = parseJobsResponse(response, locale)
      if (parsed.data.length > 0) return parsed
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err)
      // try next
    }
  }

  try {
    const response = await api.get<ApiResponse<Job[]>>(
      `/public/jobs${query}`,
      { locale, cache: "no-store", timeout: 15000 }
    )
    return parseJobsResponse(response, locale)
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error(err)
    return { data: [] }
  }
}

// Note: Removed fetchCompanyById fallback — we now respect server payloads as-is.

export async function getPublicJob(id: number, locale = "ar"): Promise<Job | null> {
  const detail = await getPublicJobDetail(id, locale)
  return detail?.job ?? null
}

export async function getPublicJobDetail(
  id: number,
  locale = "ar"
): Promise<PublicJobDetail | null> {
  const endpoints = [`/public/jobs/${id}`, `/jobs/${id}`]

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<unknown>(endpoint, {
        locale,
        cache: "no-store",
        timeout: 20000, // Increase timeout to 20 seconds for slow API
      })

      if (!response || typeof response !== "object") continue
      const root = response as Record<string, unknown>
      const payload = root.data ?? response

      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        const detail = payload as Record<string, unknown>
        const jobRaw = detail.job ?? detail
        const job = normalizeJob(jobRaw, locale)
        if (!job) continue

        const related = extractJobsList(detail.related)
          .map((item) => normalizeJob(item, locale))
          .filter((item): item is Job => item !== null)

        // Return job and related as provided by the server (no enrichment)
        return { job: job as Job, related }
      }

      const normalized = normalizeJob(payload, locale)
      if (normalized) {
        return { job: normalized, related: [] }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err)
      // try next
    }
  }

  return null
}

export async function applyForJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post(`/jobs/${jobId}/apply`, {}, { token, locale })
}

export async function toggleFavorite(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<{ is_favourite: boolean }> {
  const response = await api.post<any>(
    "/favourite-jobs/toggle",
    { job_id: jobId },
    { token, locale }
  )
  const message = response?.message || ""
  const isAdded = message.includes("إضافة") || message.toLowerCase().includes("add") || message.toLowerCase().includes("saved")
  return { is_favourite: isAdded }
}

export async function getFavoriteJobs(
  token: string,
  locale = "ar"
): Promise<Job[]> {
  const response = await api.get<ApiResponse<Job[]>>(
    "/favourite-jobs",
    { token, locale }
  )
  const parsed = parseJobsResponse(response, locale)
  return parsed.data
}
