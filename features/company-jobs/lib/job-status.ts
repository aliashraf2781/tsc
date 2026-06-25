import type { ComponentProps } from "react"
import type { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"

export type CompanyJobBadgeStatus = ComponentProps<typeof DashboardStatusBadge>["status"]

/** Map API job status to dashboard badge key (aligned with Postman: pending/approved/active/stopped/closed/rejected). */
export function mapCompanyJobBadgeStatus(status: string): CompanyJobBadgeStatus {
  const normalized = String(status || "").trim().toLowerCase()

  if (normalized === "active" || normalized === "approved" || normalized === "published") {
    return "active"
  }
  if (normalized === "rejected") return "rejected"
  if (normalized === "stopped") return "stopped"
  if (normalized === "closed") return "closed"
  if (normalized === "pending" || normalized === "draft") return "pending"

  return "pending"
}
