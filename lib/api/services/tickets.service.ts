// lib/api/services/tickets.service.ts
import { api } from "../client"
import type { ApiResponse, Ticket, PaginationMeta } from "../types"

export interface CreateTicketData {
  subject: string
  message: string
  priority?: "low" | "medium" | "high"
  receiver_id?: string
  file?: File | null
}

export async function createTicket(
  data: CreateTicketData,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  const formData = new FormData()
  
  // Set default receiver_id if not present
  const payload = {
    receiver_id: "1",
    priority: "medium",
    ...data
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  })

  const response = await api.post<ApiResponse<Ticket>>(
    "/tickets",
    formData,
    { token, locale }
  )
  return response.data
}

export async function getTickets(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Ticket[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<Ticket[]>>(
    `/tickets?page=${page}`,
    { token, locale }
  )
  return { data: response.data, meta: response.meta! }
}

export async function getTicket(
  id: number,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  const response = await api.get<ApiResponse<Ticket>>(
    `/tickets/${id}`,
    { token, locale }
  )
  return response.data
}

/** Fetch all tickets as admin — backend has no /admin/tickets, uses /tickets with admin token */
export async function getAdminTickets(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Ticket[]; meta: PaginationMeta }> {
  // Prefer admin list endpoint when available, fall back to generic tickets list
  let response: ApiResponse<Ticket[]>
  try {
    response = await api.get<ApiResponse<Ticket[]>>(
      `/admin/tickets?page=${page}`,
      { token, locale }
    )
  } catch {
    response = await api.get<ApiResponse<Ticket[]>>(
      `/tickets?page=${page}`,
      { token, locale }
    )
  }
  return { data: response.data, meta: response.meta! }
}

/** Fetch a single ticket detail as admin — backend uses /tickets/:id with admin token */
export async function getAdminTicket(
  id: number,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  // Some backends expose an admin-specific ticket detail endpoint. Try
  // `/admin/tickets/:id` first and fall back to the generic `/tickets/:id`.
  try {
    const response = await api.get<ApiResponse<Ticket>>(
      `/admin/tickets/${id}`,
      { token, locale }
    )
    return response.data
  } catch {
    const response = await api.get<ApiResponse<Ticket>>(
      `/tickets/${id}`,
      { token, locale }
    )
    return response.data
  }
}

export async function replyToTicket(
  ticketId: number,
  message: string,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  const formData = new FormData()
  formData.append("message", message)

  // Try admin reply endpoint first, fall back to user reply endpoint
  let response: ApiResponse<Ticket>
  try {
    response = await api.post<ApiResponse<Ticket>>(
      `/admin/tickets/${ticketId}/reply`,
      formData,
      { token, locale }
    )
  } catch {
    response = await api.post<ApiResponse<Ticket>>(
      `/tickets/${ticketId}/reply`,
      formData,
      { token, locale }
    )
  }
  return response.data
}

export async function updateTicketStatus(
  ticketId: number,
  status: string,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  const formData = new FormData()
  formData.append("status", status)

  // Try admin status endpoint first, fall back to user status endpoint
  let response: ApiResponse<Ticket>
  try {
    response = await api.post<ApiResponse<Ticket>>(
      `/admin/tickets/${ticketId}/status`,
      formData,
      { token, locale }
    )
  } catch {
    response = await api.post<ApiResponse<Ticket>>(
      `/tickets/${ticketId}/status`,
      formData,
      { token, locale }
    )
  }
  return response.data
}
