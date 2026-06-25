// lib/api/services/contact-messages.service.ts
import { api } from "../client"
import type { ApiResponse } from "../types"

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status?: "new" | "read" | "replied"
  created_at?: string
  createdAt?: string
}

function parseMessages(raw: unknown): ContactMessage[] {
  if (Array.isArray(raw)) return normalizeMessages(raw)
  if (!raw || typeof raw !== "object") return []
  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return normalizeMessages(obj.data)
  return []
}

function normalizeMessages(messages: unknown[]): ContactMessage[] {
  return messages.map((msg: any) => ({
    id: msg.id,
    name: msg.name,
    email: msg.email,
    phone: msg.phone,
    subject: msg.subject || "",
    message: msg.message,
    status: msg.status || "new",
    created_at: msg.created_at || msg.createdAt,
  }))
}

export async function getContactMessages(
  token: string,
  locale = "ar",
  page = 1,
  perPage = 100
): Promise<ContactMessage[]> {
  try {
    const endpoint = `/contacts?page=${page}&per_page=${perPage}`
    const response = await api.get<unknown>(endpoint, { token, locale, cache: "no-store" })
    return parseMessages(response)
  } catch {
    return []
  }
}

export async function deleteContactMessage(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/contacts/${id}`, { token, locale })
}
