"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Ticket } from "@/lib/api/types"
import { getEcho, leaveTicketChannel, ticketChannelName } from "@/lib/echo"
import { buildRootMessage, normalizeReply, type NormalizedTicketMessage } from "../lib/normalize-reply"

function readAdminCreatedFlag(ticketId: number): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = sessionStorage.getItem(`ticket-receiver-${ticketId}`)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { adminCreated?: boolean }
    return Boolean(parsed.adminCreated)
  } catch {
    return false
  }
}

function messagesFromTicket(data: Ticket, includeRoot: boolean): NormalizedTicketMessage[] {
  const replies = (data.replies || []).map((r: unknown) => normalizeReply(r as Record<string, unknown>, data))
  if (!includeRoot || !data.message) return replies

  const adminCreated = readAdminCreatedFlag(data.id)
  const root = buildRootMessage(data, adminCreated || roleIsImpliedAdmin(data))
  const filteredReplies = replies.filter(
    (r) => !(r.message === root.message && r.createdAt === root.createdAt)
  )
  return [root, ...filteredReplies]
}

/** When admin starts chat, ticket.sender is typically an admin/support label. */
function roleIsImpliedAdmin(ticket: Ticket): boolean {
  const name = (ticket.sender || "").trim().toLowerCase()
  return name === "admin" || name.includes("support") || name.includes("talent")
}

type Role = "user" | "company" | "admin"

interface UseTicketChatOptions {
  ticketId: number | null
  role: Role
  locale: string
  initialTicket?: Ticket | null
  /** Skip fetching/subscribing until true (e.g. a modal isn't open yet). */
  enabled?: boolean
}

function dedupeAppend(prev: NormalizedTicketMessage[], msg: NormalizedTicketMessage) {
  return prev.some((m) => String(m.id) === String(msg.id)) ? prev : [...prev, msg]
}

/** A reply POST may return either the new reply itself, or the whole updated ticket (with `replies`). */
function extractReplyRaw(raw: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!raw) return null
  if (Array.isArray(raw.replies) && raw.replies.length > 0) {
    return raw.replies[raw.replies.length - 1] as Record<string, unknown>
  }
  return raw
}

export function useTicketChat({ ticketId, role, locale, initialTicket = null, enabled = true }: UseTicketChatOptions) {
  const [ticket, setTicket] = useState<Ticket | null>(initialTicket)
  const [messages, setMessages] = useState<NormalizedTicketMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const ticketRef = useRef<Ticket | null>(initialTicket)

  useEffect(() => {
    ticketRef.current = ticket
  }, [ticket])

  const isAr = locale === "ar"

  useEffect(() => {
    if (!enabled || !ticketId) {
      // Reset so a stale ticket's messages don't flash while the next one loads.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([])
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/${role}/tickets/${ticketId}?locale=${locale}`, {
      credentials: "include",
      headers: { "Accept-Language": locale },
    })
      .then(async (res) => {
        if (res.status === 401) {
          router.push(`/${locale}/sign-in`)
          return null
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        return json.data || json
      })
      .then((data) => {
        if (cancelled || !data) return
        setTicket(data)
        setMessages(messagesFromTicket(data, role === "admin"))
      })
      .catch((err) => {
        console.error("[useTicketChat] load error", err)
        toast.error(isAr ? "فشل تحميل المحادثة" : "Failed to load conversation")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const echo = getEcho()
    const channel = echo.private(ticketChannelName(ticketId))
    channel.listen(".reply.sent", (payload: Record<string, unknown>) => {
      const msg = normalizeReply(payload, ticketRef.current)
      setMessages((prev) => dedupeAppend(prev, msg))
      setTicket((prev) => (prev ? { ...prev, status: msg.isAdmin ? "answered" : "open" } : prev))
    })

    return () => {
      cancelled = true
      leaveTicketChannel(ticketId)
    }
  }, [ticketId, role, locale, enabled, router, isAr])

  const sendMessage = useCallback(
    async (message: string, file?: File | null) => {
      if (!ticketId || !message.trim()) return

      if (ticketRef.current?.status === "closed") {
        toast.error(isAr ? "لا يمكن الرد على تذكرة مغلقة" : "This ticket is closed and cannot receive replies")
        return
      }

      setSending(true)
      try {
        let res: Response
        if (file) {
          const formData = new FormData()
          formData.append("message", message.trim())
          formData.append("file", file)
          res = await fetch(`/api/${role}/tickets/${ticketId}/reply`, {
            method: "POST",
            credentials: "include",
            headers: { "Accept-Language": locale },
            body: formData,
          })
        } else {
          res = await fetch(`/api/${role}/tickets/${ticketId}/reply`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", "Accept-Language": locale },
            body: JSON.stringify({ message: message.trim() }),
          })
        }

        if (res.status === 401) {
          router.push(`/${locale}/sign-in`)
          return
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.message || "Failed to send reply")
        }

        const json = await res.json()
        const raw = (json.data || json) as Record<string, unknown> | null
        const replyRaw = extractReplyRaw(raw)

        const msg =
          replyRaw && replyRaw.message
            ? normalizeReply(replyRaw, ticketRef.current)
            : {
                id: `local-${Date.now()}`,
                message: message.trim(),
                isAdmin: role === "admin",
                senderName: "",
                files: file ? [file.name] : [],
                createdAt: new Date().toISOString(),
              }

        setMessages((prev) => dedupeAppend(prev, msg))

        const nextStatus = typeof raw?.status === "string" ? raw.status : role === "admin" ? "answered" : "open"
        setTicket((prev) => (prev ? { ...prev, status: nextStatus as Ticket["status"] } : prev))
      } catch (err) {
        console.error("[useTicketChat] send error", err)
        const msg = err instanceof Error ? err.message : undefined
        toast.error(msg || (isAr ? "فشل إرسال الرد" : "Failed to send reply"))
        throw err
      } finally {
        setSending(false)
      }
    },
    [ticketId, role, locale, isAr, router]
  )

  return { ticket, messages, loading, sending, sendMessage }
}
