type NotificationData = Record<string, unknown>

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return undefined
}

function pickId(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value == null || value === "") continue
    const num = Number(value)
    if (Number.isFinite(num) && num > 0) return String(num)
  }
  return undefined
}

/** Build an in-app path from notification payload fields (Postman / Laravel shapes). */
export function resolveNotificationUrl(
  data: NotificationData | undefined,
  role = "user"
): string | undefined {
  if (!data) return undefined

  const direct = pickString(data.url, data.link, data.action_url, data.path, data.href)
  if (direct) return direct

  const jobId = pickId(data.job_id, data.jobId, data.job)
  const applicationId = pickId(data.application_id, data.applicationId, data.application)
  const ticketId = pickId(data.ticket_id, data.ticketId, data.ticket)
  const userId = pickId(data.user_id, data.userId)

  const normalizedRole = String(role || "user").toLowerCase()

  if (applicationId && jobId) {
    if (normalizedRole === "company") {
      return `/dashboard/company/jobs/${jobId}/applications/${applicationId}`
    }
    if (normalizedRole === "admin") {
      return `/dashboard/admin/jobs/${jobId}/applications/${applicationId}`
    }
    return `/dashboard/user/applications/${applicationId}`
  }

  if (jobId) {
    if (normalizedRole === "company") return `/dashboard/company/jobs/${jobId}/applications`
    if (normalizedRole === "admin") return `/dashboard/admin/jobs/${jobId}`
    return `/jobs/${jobId}`
  }

  if (ticketId) {
    if (normalizedRole === "admin") return `/dashboard/admin/tickets/${ticketId}`
    return `/dashboard/${normalizedRole === "company" ? "company" : "user"}/tickets/${ticketId}`
  }

  if (userId && normalizedRole === "admin") {
    return `/dashboard/admin/users/${userId}`
  }

  const type = pickString(data.type, data.notification_type, data.event)?.toLowerCase() ?? ""

  if (type.includes("application") && jobId) {
    return normalizedRole === "company"
      ? `/dashboard/company/jobs/${jobId}/applications`
      : `/dashboard/user/applications`
  }

  if (type.includes("ticket") && ticketId) {
    return `/dashboard/${normalizedRole === "company" ? "company" : "user"}/tickets/${ticketId}`
  }

  if (type.includes("job") && jobId) {
    return normalizedRole === "company"
      ? `/dashboard/company/jobs/${jobId}`
      : `/jobs/${jobId}`
  }

  return undefined
}
