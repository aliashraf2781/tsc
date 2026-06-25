"use client"

import React from "react"
import { useLocale } from "next-intl"
import { CheckCircle, XCircle, Clock, Briefcase } from "lucide-react"
import { Link } from "@/i18n/navigation"

interface Job {
  id: number
  title: string
  appliedCandidates: number
  deadline: string
  status: "approved" | "rejected" | "pending"
}

interface LastJobTableProps {
  jobs: Job[]
  title: string
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const config = {
    approved: {
      bg: "bg-[#E7D7FA]",
      border: "border-[#B66FED]",
      text: "text-[#9333CD]",
      label: "Approved",
      icon: CheckCircle,
    },
    rejected: {
      bg: "bg-[#FDEDED]",
      border: "border-[#F78E8E]",
      text: "text-[#F53334]",
      label: "Rejected",
      icon: XCircle,
    },
    pending: {
      bg: "bg-[#FFEEDE]",
      border: "border-[#FCB304]",
      text: "text-[#FCB304]",
      label: "Pending",
      icon: Clock,
    },
  }

  const { bg, border, text, label, icon: Icon } = config[status]

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${bg} ${border} w-fit`}>
      <Icon className={`w-4 h-4 ${text}`} />
      <span className={`text-xs font-medium ${text}`}>{label}</span>
    </div>
  )
}

export function LastJobTable({ jobs, title }: LastJobTableProps) {
  const locale = useLocale()
  const isRTL = locale === "ar"

  const t = {
    jobTitle: locale === "ar" ? "عنوان الوظيفة" : "Job Title",
    appliedCandidate: locale === "ar" ? "المرشحين المتقدمين" : "Applied Candidate",
    deadline: locale === "ar" ? "الموعد النهائي" : "Deadline",
    status: locale === "ar" ? "الحالة" : "Status",
    actions: locale === "ar" ? "الإجراءات" : "Actions",
    details: locale === "ar" ? "التفاصيل" : "Details",
  }

  return (
    <div className="mb-8">
      <h2 className="text-[20px] font-semibold text-gray-900 mb-4">{title}</h2>
      
      {/* Table Header */}
      <div className={`flex items-center py-2 px-2 bg-gradient-to-r from-[#032C44] to-[#41A0CA] rounded-t-[8px] `}>
        <div className="w-[300px] px-2">
          <span className="text-[16px] text-white font-medium">{t.jobTitle}</span>
        </div>
        <div className="flex-1 px-2 flex justify-center">
          <span className="text-[16px] text-white font-medium">{t.appliedCandidate}</span>
        </div>
        <div className="flex-1 px-2 flex justify-center">
          <span className="text-[16px] text-white font-medium">{t.deadline}</span>
        </div>
        <div className="flex-1 px-2 flex justify-center">
          <span className="text-[16px] text-white font-medium">{t.status}</span>
        </div>
        <div className={`flex-1 px-2 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[16px] text-white font-medium">{t.actions}</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="rounded-b-[8px] overflow-hidden border border-gray-100 border-t-0">
        {jobs.length > 0 ? (
          jobs.map((job, index) => {
            const isEven = index % 2 === 0
            return (
              <div 
                key={job.id} 
                className={`flex items-center py-2 px-2 transition-colors ${isEven ? "bg-white" : "bg-gradient-to-r from-[#032C44]/10 to-[#41A0CA]/10"}`}
              >
                <div className="w-[300px] px-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-[16px] text-gray-900 font-medium">{job.title}</span>
                </div>
                <div className="flex-1 px-2 flex justify-center">
                  <span className="text-[16px] text-gray-900">{job.appliedCandidates}</span>
                </div>
                <div className="flex-1 px-2 flex justify-center">
                  <span className="text-[16px] text-gray-900">{job.deadline}</span>
                </div>
                <div className="flex-1 px-2 flex justify-center">
                  <StatusBadge status={job.status} />
                </div>
                <div className={`flex-1 px-2 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <Link 
                    href={`/dashboard/company/jobs/${job.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#006EA8] to-[#005685] rounded-[8px] shadow-[inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF] hover:shadow-lg transition-shadow"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={isRTL ? 'scale-x-[-1]' : ''}>
                      <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" fill="white" />
                      <path d="M20 7H4C2.9 7 2 7.9 2 9V11H22V9C22 7.9 21.1 7 20 7Z" fill="white" fillOpacity="0.4" />
                    </svg>
                    <span className="text-[12px] text-white font-medium">{t.details}</span>
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white">
            {locale === "ar" ? "لا توجد وظائف" : "No jobs found"}
          </div>
        )}
      </div>
    </div>
  )
}