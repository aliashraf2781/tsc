let inflight: Promise<number> | null = null
let cached: { count: number; fetchedAt: number } | null = null
const CACHE_TTL_MS = 30_000

export async function fetchUnreadCountClient(): Promise<number> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.count
  }

  if (inflight) return inflight

  inflight = (async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        credentials: "include",
        cache: "no-store",
      })
      if (!res.ok) return cached?.count ?? 0
      const data = await res.json()
      const countVal = data?.unread_count ?? data?.count
      const count =
        typeof countVal === "number"
          ? countVal
          : Number.isFinite(Number(countVal))
            ? Number(countVal)
            : 0
      cached = { count, fetchedAt: Date.now() }
      return count
    } catch {
      return cached?.count ?? 0
    } finally {
      inflight = null
    }
  })()

  return inflight
}

export function invalidateUnreadCountCache() {
  cached = null
}
