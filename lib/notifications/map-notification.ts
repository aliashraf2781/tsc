import { resolveNotificationUrl } from "@/lib/notifications/resolve-notification-url"

export type HeaderNotification = {
  id: number
  title: string
  description: string
  time: string
  read: boolean
  actionUrl?: string
}

export type NotificationsPageResult = {
  items: HeaderNotification[]
  currentPage: number
  lastPage: number
  hasMore: boolean
}

type RawNotification = {
  id: number
  title: string
  body?: string
  message?: string
  created_at?: string
  createdAt?: string
  read_at?: string | null
  isRead?: boolean
  is_read?: boolean
  data?: Record<string, unknown>
}

export function mapNotificationItem(
  n: RawNotification,
  role: string,
  locale: string
): HeaderNotification {
  const nData = n.data ?? {}
  const actionUrl =
    resolveNotificationUrl(nData, role) ||
    (nData.url as string) ||
    (nData.link as string) ||
    (nData.action_url as string) ||
    (nData.path as string) ||
    undefined

  const rawTime = n.created_at || n.createdAt
  return {
    id: n.id,
    title: n.title,
    description: n.body || n.message || "",
    time: rawTime
      ? new Date(rawTime).toLocaleString(locale === "ar" ? "ar-EG" : locale)
      : "",
    read: Boolean(n.read_at) || Boolean(n.isRead) || Boolean(n.is_read),
    actionUrl,
  }
}

export async function fetchNotificationsPageClient(options: {
  page: number
  locale: string
  role: string
}): Promise<NotificationsPageResult> {
  const { page, locale, role } = options
  const res = await fetch(`/api/notifications?page=${page}`, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Accept-Language": locale,
      "x-locale": locale,
    },
  })

  if (!res.ok) {
    return { items: [], currentPage: page, lastPage: page, hasMore: false }
  }

  const data = await res.json()
  const list = Array.isArray(data.data) ? (data.data as RawNotification[]) : []
  const items = list.map((n) => mapNotificationItem(n, role, locale))

  const meta = data.meta as
    | { current_page?: number; last_page?: number; per_page?: number }
    | undefined
  const currentPage = Number(meta?.current_page) || page
  const lastPage = Math.max(1, Number(meta?.last_page) || currentPage)
  const perPage = Math.max(1, Number(meta?.per_page) || 10)
  const hasMore = meta?.last_page != null
    ? currentPage < lastPage
    : items.length >= perPage

  return { items, currentPage, lastPage, hasMore }
}
