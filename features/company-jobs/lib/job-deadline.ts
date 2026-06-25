import type { Job } from "@/lib/api/types"
import { resolveJobApplicationDeadline } from "@/features/jobs/lib/job-display"

function parseDeadline(value?: string): Date | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const endOfDay = new Date(`${trimmed}T23:59:59`)
    return Number.isNaN(endOfDay.getTime()) ? null : endOfDay
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isJobDeadlinePassed(job: Pick<Job, "application_deadline"> | Record<string, unknown>): boolean {
  const deadline = resolveJobApplicationDeadline(job)
  const parsed = parseDeadline(deadline)
  if (!parsed) return false
  return Date.now() > parsed.getTime()
}

export function isJobLiveStatus(status?: string): boolean {
  const normalized = String(status || "").toLowerCase()
  return normalized === "approved" || normalized === "active"
}
