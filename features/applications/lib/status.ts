import type { AppLocale } from "./types"

export type ApplicationStatus = "pending" | "accepted" | "approved" | "rejected" | "reviewed" | "stopped"

export type StatusStyle = { bg: string; text: string; border: string }

const STATUS_STYLES: Record<ApplicationStatus, StatusStyle> = {
  pending: { bg: "bg-[#FFF8EE]", text: "text-[#FFB64D]", border: "border-[#FFB64D]" },
  accepted: { bg: "bg-[#EAFBF3]", text: "text-[#39DA8A]", border: "border-[#39DA8A]" },
  approved: { bg: "bg-[#F3E8FF]", text: "text-[#9333CD]", border: "border-[#D8B4FE]" },
  rejected: { bg: "bg-[#FFF5F5]", text: "text-[#FF5B5C]", border: "border-[#FF5B5C]" },
  reviewed: { bg: "bg-[#EFF6FF]", text: "text-[#1E40AF]", border: "border-[#BFDBFE]" },
  stopped: { bg: "bg-[#F3F4F6]", text: "text-[#4B5563]", border: "border-[#D1D5DB]" },
}

const STATUS_LABELS: Record<ApplicationStatus, Record<AppLocale, string>> = {
  pending: { ar: "قيد المراجعة", en: "Pending", de: "Ausstehend" },
  accepted: { ar: "مقبول", en: "Accepted", de: "Akzeptiert" },
  approved: { ar: "مقبول", en: "Approved", de: "Freigegeben" },
  rejected: { ar: "مرفوض", en: "Rejected", de: "Abgelehnt" },
  reviewed: { ar: "تمت المراجعة", en: "Reviewed", de: "Überprüft" },
  stopped: { ar: "موقوفة", en: "Stopped", de: "Gestoppt" },
}

function normalizeStatus(status: string): ApplicationStatus {
  return status in STATUS_STYLES ? (status as ApplicationStatus) : "pending"
}

export function getApplicationStatusStyle(status: string): StatusStyle {
  return STATUS_STYLES[normalizeStatus(status)]
}

export function getApplicationStatusLabel(status: string, locale: AppLocale): string {
  return STATUS_LABELS[normalizeStatus(status)][locale]
}
