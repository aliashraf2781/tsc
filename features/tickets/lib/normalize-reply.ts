import type { Ticket, TicketReply } from "@/lib/api/types"

export interface NormalizedTicketMessage {
  id: number | string
  message: string
  isAdmin: boolean
  senderName: string
  files: string[]
  createdAt?: string
}

/** Build the opening bubble from ticket.message (API omits it from replies[]). */
export function buildRootMessage(ticket: Ticket, forceAdminSender = false): NormalizedTicketMessage {
  const attachments = Array.isArray(ticket.attachments) ? ticket.attachments : []
  const senderName = ticket.sender || ""

  let isAdmin = forceAdminSender
  if (!forceAdminSender) {
    // Prefer an explicit heuristic when we know this was an admin-started chat.
    isAdmin = resolveIsAdmin(
      { user: { name: senderName } },
      { name: senderName },
      senderName,
      null
    )
  }

  return {
    id: `ticket-root-${ticket.id}`,
    message: ticket.message || "",
    isAdmin,
    senderName,
    files: attachments,
    createdAt: ticket.created_at,
  }
}

/**
 * Reduces the various reply shapes this backend has sent over time (flat
 * `{user: string, date}` vs the newer `{user: {id, name, is_admin}, created_at}`,
 * plus raw Pusher `.reply.sent` payloads which share the same shape) into one
 * canonical message the chat UI can render consistently.
 */
export function normalizeReply(raw: TicketReply | Record<string, unknown>, ticket?: Ticket | null): NormalizedTicketMessage {
  const r = raw as Record<string, unknown>
  const user = r.user as TicketReply["user"] | undefined
  const userObj = user && typeof user === "object" ? (user as Record<string, unknown>) : null

  const senderName =
    (userObj?.name as string | undefined) ||
    (typeof user === "string" ? user : undefined) ||
    (r.sender_name as string | undefined) ||
    ""

  const isAdmin = resolveIsAdmin(r, userObj, senderName, ticket)

  const files = Array.isArray(r.files) ? (r.files as string[]) : []

  const id = (r.id as number | string | undefined) ?? `${r.created_at || r.date || ""}-${senderName}-${String(r.message).slice(0, 20)}`

  return {
    id,
    message: (r.message as string) || "",
    isAdmin,
    senderName,
    files,
    createdAt: (r.created_at as string | undefined) || (r.date as string | undefined),
  }
}

function resolveIsAdmin(
  r: Record<string, unknown>,
  userObj: Record<string, unknown> | null,
  senderName: string,
  ticket?: Ticket | null
): boolean {
  // Prefer the explicit, reliable flag when present.
  if (userObj && "is_admin" in userObj) {
    const v = userObj.is_admin
    return v === true || v === 1 || v === "1"
  }
  if ("is_admin" in r) {
    const v = r.is_admin
    return v === true || v === 1 || v === "1"
  }

  const role = (userObj?.role as string | undefined)?.toLowerCase()
  const email = (userObj?.email as string | undefined)?.toLowerCase()
  if (role === "admin" || role === "talent-seeker") return true
  if (email?.includes("admin") || email === "info@talent-sc.com") return true

  const nameLower = senderName.trim().toLowerCase()
  if (nameLower === "talent-seeker" || nameLower === "admin" || nameLower.includes("support")) return true

  // Fall back to the original heuristic: a reply from anyone other than the
  // ticket's own sender is treated as a support/admin reply.
  if (ticket?.sender) {
    return nameLower !== ticket.sender.trim().toLowerCase()
  }

  return false
}
