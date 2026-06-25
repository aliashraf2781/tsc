"use client"

import React from "react"
import { useRouter, Link } from "@/i18n/navigation"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { cn } from "@/lib/utils"

type Props = {
  applicationId: number | string
  candidateName: string
  appStatus: "pending" | "accepted" | "rejected"
  statusLabels: Record<string, string>
  appliedAt: string
  email?: string
  cvUrl?: string | null
  jobId: number
  index: number
  locale: string
  isRtl: boolean
  viewCvLabel: string
  showLabel: string
}

export default function AdminApplicationRowClient({
  applicationId,
  candidateName,
  appStatus,
  statusLabels,
  appliedAt,
  email,
  cvUrl,
  jobId,
  index,
  locale,
  isRtl,
  viewCvLabel,
  showLabel,
}: Props) {
  const router = useRouter()

  const navigate = () => {
    router.push(`/dashboard/admin/jobs/${jobId}/applications/${applicationId}`)
  }

  return (
    <div onClick={navigate}
      className={cn(
        "flex items-center border-b border-[#F0F4F8] last:border-0 cursor-pointer transition-colors duration-150 hover:bg-[#F0F9FF]",
        index % 2 === 0 ? "bg-white" : "bg-[#F9FBFD]"
      )}
    >
      <div className="w-[25%] px-4 py-4 text-sm font-semibold text-[#111827]">
        {candidateName}
      </div>
      <div className="w-[18%] px-4 py-4 text-center">
        <DashboardStatusBadge status={appStatus} label={statusLabels[appStatus]} />
      </div>
      <div className="w-[20%] px-4 py-4 text-sm text-[#4B5563]">{appliedAt}</div>
      <div className="w-[20%] px-4 py-4 text-sm text-[#4B5563]">{email ?? "—"}</div>
      <div className="flex-1 flex items-center justify-center gap-2 px-4 py-4">
        {cvUrl ? (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D1FAE5] px-3 py-1.5 text-xs font-semibold text-[#065F46] hover:bg-[#A7F3D0]"
          >
            📄 {viewCvLabel}
          </a>
        ) : (
          <span className="text-xs text-[#9CA3AF]">—</span>
        )}

        <Link
          locale={locale}
          href={`/dashboard/admin/jobs/${jobId}/applications/${applicationId}`}
          onClick={(e: any) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#78A3BE] bg-white px-3 py-1.5 text-xs font-semibold text-[#006EA8] hover:bg-[#F5F9FC]"
        >
          {showLabel}
        </Link>
      </div>
    </div>
  )
}
