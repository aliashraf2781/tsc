import { ApiError } from "@/lib/api/client"

export function formatApiValidationMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const parts: string[] = []
    if (err.errors) {
      for (const messages of Object.values(err.errors)) {
        if (Array.isArray(messages)) parts.push(...messages)
      }
    }
    if (parts.length > 0) return parts.join(" · ")
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
