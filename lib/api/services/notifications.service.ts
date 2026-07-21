// lib/api/services/notifications.service.ts
import { api } from "../client"
import type { ApiResponse, Notification, PaginationMeta } from "../types"

function pickLocalizedString(value: unknown, locale?: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed === "object") {
          value = parsed
        }
      } catch {
        // ignore and treat as plain string
      }
    } else {
      return value
    }
  }
  if (value && typeof value === "object") {
    const map = value as Record<string, string>
    if (locale && map[locale]) return map[locale]
    return map.ar ?? map.en ?? map.de ?? Object.values(map).find((v) => typeof v === "string") ?? ""
  }
  return ""
}

function extractNotificationsList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== "object") return []

  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data
  if (Array.isArray(obj.items)) return obj.items
  if (Array.isArray(obj.notifications)) return obj.notifications

  return []
}

function normalizeNotification(item: unknown, index: number, locale?: string): Notification | null {
  if (!item || typeof item !== "object") return null

  const row = item as Record<string, unknown>
  const id = typeof row.id === "number" ? row.id : index + 1

  const activeLocale = locale || "ar"
  const title =
    pickLocalizedString(row.title, activeLocale) ||
    pickLocalizedString(row[`title_${activeLocale}`], activeLocale) ||
    pickLocalizedString(row.title_ar || row.title_en || row.title_de, activeLocale)

  const body =
    pickLocalizedString(row.body ?? row.content ?? row.message, activeLocale) ||
    pickLocalizedString(row[`body_${activeLocale}`] ?? row[`message_${activeLocale}`] ?? row[`content_${activeLocale}`], activeLocale) ||
    pickLocalizedString(row.body_ar || row.message_ar || row.body_en || row.message_en || row.body_de || row.message_de, activeLocale)

  const created_at =
    (typeof row.createdAt === "string" && row.createdAt) ||
    (typeof row.created_at === "string" && row.created_at) ||
    new Date().toISOString()

  // Backend uses boolean `isRead` or `read` or string `read_at`
  const isRead = row.isRead === true || row.is_read === true || row.read === true
  const read_at = typeof row.read_at === "string" ? row.read_at : (isRead ? new Date().toISOString() : undefined)

  if (!title && !body) return null

  let rawData = row.data
  if (typeof rawData === "string") {
    try {
      rawData = JSON.parse(rawData)
    } catch {}
  }
  const dataObj = (rawData && typeof rawData === "object") ? (rawData as Record<string, unknown>) : {}

  // Merge any root-level url/action_url/link/path into the data object
  if (row.url) dataObj.url = row.url
  if (row.action_url) dataObj.action_url = row.action_url
  if (row.link) dataObj.link = row.link
  if (row.path) dataObj.path = row.path

  return {
    id,
    title: title || "—",
    body: body || "",
    read_at,
    created_at,
    data: dataObj,
  }
}

function extractPaginationMeta(raw: unknown): PaginationMeta | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined

  const obj = raw as Record<string, unknown>
  const current = Number(obj.current_page ?? obj.currentPage)
  const last = Number(obj.last_page ?? obj.lastPage)
  if (!Number.isFinite(current) || !Number.isFinite(last) || last < 1) return undefined

  return {
    current_page: Math.max(1, current),
    last_page: Math.max(1, last),
    per_page: Math.max(1, Number(obj.per_page ?? obj.perPage ?? 10) || 10),
    total: Math.max(0, Number(obj.total ?? 0) || 0),
  }
}

function parseNotificationsResponse(response: unknown, locale?: string): {
  data: Notification[]
  meta?: PaginationMeta
} {
  if (!response || typeof response !== "object") {
    return { data: [] }
  }

  const root = response as Record<string, unknown>
  const meta =
    extractPaginationMeta(root.meta) ||
    extractPaginationMeta(root.pagination) ||
    extractPaginationMeta(root.data)

  const candidates = [root.data, root, extractNotificationsList(root.data)]

  for (const candidate of candidates) {
    const list = extractNotificationsList(candidate)
    if (list.length === 0) continue

    const data = list
      .map((item, index) => normalizeNotification(item, index, locale))
      .filter((item): item is Notification => item !== null)

    return { data, meta }
  }

  return { data: [], meta }
}

export async function getNotifications(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Notification[]; meta?: PaginationMeta }> {
  try {
    const response = await api.get<unknown>(
      `/notifications?page=${page}`,
      { token, locale }
    )
    return parseNotificationsResponse(response, locale)
  } catch (err) {
    return { data: [] }
  }
}

export async function markAsRead(
  notificationId: number,
  token: string,
  locale = "ar"
): Promise<Notification> {
  const response = await api.put<ApiResponse<unknown>>(
    `/notifications/${notificationId}/read`,
    {},
    { token, locale }
  )
  const root = response.data ?? response
  return normalizeNotification(root, 0, locale) ?? {
    id: notificationId,
    title: "",
    body: "",
    created_at: new Date().toISOString(),
  }
}

export async function markAllAsRead(
  token: string,
  locale = "ar"
): Promise<void> {
  await api.put("/notifications/read-all", {}, { token, locale })
}

export async function deleteNotification(
  notificationId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/notifications/${notificationId}`, { token, locale })
}

export async function getUnreadCount(
  token: string,
  locale = "ar"
): Promise<{ unread_count: number }> {
  try {
    const response = await api.get<ApiResponse<{ count?: number | string; unread_count?: number | string }>>(
      "/notifications/unread-count",
      { token, locale }
    )
    const raw = response?.data ?? response
    const countVal = raw?.unread_count ?? raw?.count ?? 0
    const count = typeof countVal === "number" ? countVal : (isNaN(Number(countVal)) ? 0 : Number(countVal))
    return { unread_count: count }
  } catch (err) {
    return { unread_count: 0 }
  }
}

export async function registerDeviceToken(
  deviceToken: string,
  deviceType: "web" | "android" | "ios",
  token: string,
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  formData.append("device_token", deviceToken)
  formData.append("device_type", deviceType)
  await api.post("/notifications/token", formData, { token, locale })
}
