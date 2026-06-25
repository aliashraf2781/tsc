/** Returns true when the value looks like a UUID route key. */
export function isUuidRouteId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

type UserRouteSource =
  | number
  | string
  | {
      id?: number | string
      uuid?: string | null
    }

/** Prefer backend UUID route keys; fall back to numeric/string id. */
export function resolveUserRouteId(source: UserRouteSource): string {
  if (source && typeof source === "object") {
    const uuid = source.uuid?.trim()
    if (uuid) return uuid
    if (source.id != null && String(source.id).trim()) return String(source.id)
    return ""
  }

  return String(source ?? "").trim()
}

/** Normalize uuid from heterogeneous API payloads. */
export function extractUserUuid(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const row = raw as Record<string, unknown>
  const candidate = row.uuid ?? row.uid ?? row.user_uuid ?? row.userUuid
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined
}
