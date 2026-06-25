// lib/api/services/contact.service.ts
import { api } from "../client"
import type { ApiResponse } from "../types"

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export async function sendContact(
  data: ContactFormData,
  locale = "ar"
): Promise<{ message: string }> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })

  // Try the primary endpoint, fall back to alternative endpoints
  const endpoints = ["/contact", "/contacts", "/contact-us"]

  for (const endpoint of endpoints) {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        endpoint,
        formData,
        { locale }
      )
      // If we got a valid response, return it
      if (response && (response.data || response.message)) {
        return { message: response.data?.message || response.message || "Message sent successfully" }
      }
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string }
      // If it's a 404, try the next endpoint
      if (error?.status === 404) {
        console.warn(`[sendContact] ${endpoint} returned 404, trying next endpoint...`)
        continue
      }
      // For other errors (validation, server error), re-throw
      throw err
    }
  }

  // If all endpoints failed with 404, try one last time and let it throw
  throw new Error(locale === "ar" ? "لم يتم العثور على خدمة التواصل. يرجى التواصل معنا عبر البريد الإلكتروني." : "Contact service not found. Please reach us via email.")
}
