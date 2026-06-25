import { CheckCircle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type JobStatus =
  | "approved"
  | "rejected"
  | "pending"
  | "accepted"
  | "reviewed"
  | "stopped"
  | "closed"
  | "active"

type StatusConfig = {
  label: { ar: string; en: string; de: string }
  className: string
  icon: typeof CheckCircle
}

const CONFIG: Record<JobStatus, StatusConfig> = {
  approved: {
    label: { ar: "مقبول", en: "Approved", de: "Freigegeben" },
    className: "bg-[#E7D7FA] border-[#B66FED] text-[#9333CD]",
    icon: CheckCircle,
  },
  accepted: {
    label: { ar: "مقبول", en: "Accepted", de: "Akzeptiert" },
    className: "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]",
    icon: CheckCircle,
  },
  rejected: {
    label: { ar: "مرفوض", en: "Rejected", de: "Abgelehnt" },
    className: "bg-[#FDEDED] border-[#F78E8E] text-[#F53334]",
    icon: XCircle,
  },
  pending: {
    label: { ar: "قيد المراجعة", en: "Pending", de: "Ausstehend" },
    className: "bg-[#FFEEDE] border-[#FCB304] text-[#FCB304]",
    icon: Clock,
  },
  reviewed: {
    label: { ar: "تمت المراجعة", en: "Reviewed", de: "Überprüft" },
    className: "bg-[#DBEAFE] border-[#BFDBFE] text-[#1E40AF]",
    icon: Clock,
  },
  stopped: {
    label: { ar: "موقوفة", en: "Stopped", de: "Gestoppt" },
    className: "bg-[#F3F4F6] border-[#D1D5DB] text-[#4B5563]",
    icon: XCircle,
  },
  closed: {
    label: { ar: "مغلقة", en: "Closed", de: "Geschlossen" },
    className: "bg-[#F3F4F6] border-[#D1D5DB] text-[#4B5563]",
    icon: XCircle,
  },
  active: {
    label: { ar: "نشطة", en: "Active", de: "Aktiv" },
    className: "bg-[#E7D7FA] border-[#B66FED] text-[#9333CD]",
    icon: CheckCircle,
  },
}

export function DashboardStatusBadge({
  status,
  label,
  locale,
}: {
  status: string
  label?: string
  locale?: string
}) {
  const key = (status in CONFIG ? status : "pending") as JobStatus
  const cfg = CONFIG[key]
  const Icon = cfg.icon
  const isAr = locale === "ar"
  const isDe = locale === "de"
  const displayLabel = label ?? (isAr ? cfg.label.ar : isDe ? cfg.label.de : cfg.label.en)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-normal",
        cfg.className
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-100" aria-hidden />
      {displayLabel}
    </span>
  )
}
