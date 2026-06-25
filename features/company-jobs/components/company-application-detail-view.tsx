"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { CloudDownload } from "lucide-react"
import type { CompanyApplication } from "@/features/company-jobs/lib/application-utils"
import { mapApplicationStatus, normalizePortfolioShape, getApplicantDisplayName } from "@/features/company-jobs/lib/application-utils"
import { CompanyApplicationActions } from "@/features/company-jobs/components/company-application-actions"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { cn } from "@/lib/utils"

type TabKey = "overview" | "education" | "experience"

type CompanyApplicationDetailViewProps = {
  application: CompanyApplication
  jobId: number
  jobTitle: string
  locale: string
  maskApplicantName?: boolean
  userProfileHref?: string
}

function formatDate(dateStr?: string, locale?: string) {
  if (!dateStr) return "—"
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function calcAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) return null
  const birth = new Date(dateOfBirth)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

function maskFullName(fullName?: string | null) {
  if (!fullName) return "—"
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return "—"
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts.slice(1).map(() => "****").join(" ")}`
}

export function CompanyApplicationDetailView({
  application,
  jobId,
  jobTitle,
  locale,
  maskApplicantName = true,
  userProfileHref,
}: CompanyApplicationDetailViewProps) {
  const isAr = locale === "ar"
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview")

  const labels = {
    back: isAr ? "العودة إلى الطلبات" : "Back to Applications",
    backToJobs: isAr ? "العودة لكل الوظائف" : "Back to Jobs",
    overview: isAr ? "نظرة عامة" : "Overview",
    education: isAr ? "التعليم" : "Educations",
    experience: isAr ? "الخبرة والمهارات" : "Experience And Skills",
    downloadCv: isAr ? "تحميل السيرة الذاتية" : "Download CV",
    dateOfBirth: isAr ? "تاريخ الميلاد" : "Date Of Birth",
    age: isAr ? "العمر" : "Age",
    gender: isAr ? "الجنس" : "Gender",
    maritalStatus: isAr ? "الحالة الاجتماعية" : "Marital Status",
    category: isAr ? "المجال" : "Category",
    languages: isAr ? "اللغات" : "Language",
    years: isAr ? "سنة" : "Years",
    male: isAr ? "ذكر" : "Male",
    female: isAr ? "أنثى" : "Female",
    single: isAr ? "أعزب" : "Single",
    married: isAr ? "متزوج" : "Married",
    noEducation: isAr ? "لا توجد مؤهلات تعليمية" : "No education records",
    noExperience: isAr ? "لا توجد خبرات مهنية" : "No work experience",
    noSkills: isAr ? "لا توجد مهارات" : "No skills added",
    currentlyWorking: isAr ? "حتى الآن" : "Present",
    responsibilities: isAr ? "المسؤوليات" : "Responsibilities",
    unknownCandidate: isAr ? "متقدم غير مسمى" : "Unnamed candidate",
  }

  const applicantName = getApplicantDisplayName(application, {
    mask: maskApplicantName,
    unknownLabel: labels.unknownCandidate,
  })
  const portfolio = normalizePortfolioShape(application.userPortfolio || {})
  const profile = application.user?.Userprofile
  const status = mapApplicationStatus(application.status)
  const cvUrl = application.cv_url || portfolio.cv
  const location = [application.user?.city?.name, application.user?.country?.name].filter(Boolean).join(", ")

  const formatDegree = (degree?: string) => {
    const map: Record<string, string> = {
      high_school: isAr ? "ثانوية عامة" : "High School",
      bachelor: isAr ? "بكالوريوس" : "Bachelor",
      master: isAr ? "ماجستير" : "Master",
      phd: isAr ? "دكتوراه" : "PhD",
    }
    return map[String(degree || "").toLowerCase()] || degree || "—"
  }

  const formatGrade = (grade?: string) => {
    const map: Record<string, string> = {
      excellent: isAr ? "ممتاز" : "Excellent",
      very_good: isAr ? "جيد جداً" : "Very Good",
      good: isAr ? "جيد" : "Good",
      pass: isAr ? "مقبول" : "Pass",
    }
    return map[String(grade || "").toLowerCase()] || grade || "—"
  }

  const formatGender = (gender?: string | null) => {
    const value = String(gender || "").toLowerCase()
    if (value.includes("female") || value.includes("أنثى")) return labels.female
    if (value.includes("male") || value.includes("ذكر")) return labels.male
    return gender || "—"
  }

  const formatMaritalStatus = (status?: string | null) => {
    const value = String(status || "").toLowerCase()
    if (value === "single" || value === "أعزب") return labels.single
    if (value === "married" || value === "متزوج") return labels.married
    return status || "—"
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "overview", label: labels.overview },
    { key: "education", label: labels.education },
    { key: "experience", label: labels.experience },
  ]

  const formatLanguageLevel = (level?: string) => {
    const val = String(level || "").toLowerCase().trim()
    const map: Record<string, string> = {
      beginner: isAr ? "مبتدئ" : locale === "de" ? "Anfänger" : "Beginner",
      intermediate: isAr ? "متوسط" : locale === "de" ? "Mittelstufe" : "Intermediate",
      fluent: isAr ? "طلاقة" : locale === "de" ? "Fließend" : "Fluent",
      native: isAr ? "اللغة الأم" : locale === "de" ? "Muttersprache" : "Native",
    }
    return map[val] || level || ""
  }

  const languageList = portfolio.languages
    .map((lang: Record<string, unknown>) => {
      const name = String(lang.language || "").trim()
      const level = String(lang.level || "").trim()
      if (!name) return ""
      const translatedLevel = formatLanguageLevel(level)
      return translatedLevel ? `${name} (${translatedLevel})` : name
    })
    .filter(Boolean)
    .join(isAr ? "، " : ", ")

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return ""
    try {
      const filename = String(url).split("/").pop() || String(url)
      const decoded = decodeURIComponent(filename)
      return decoded.replace(/[-_]+/g, " ")
    } catch {
      return String(url)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/company/jobs/${jobId}/applications`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8] hover:underline"
        >
          <span aria-hidden>{isAr ? "→" : "←"}</span>
          {labels.back}
        </Link>
        <Link
          href="/dashboard/company/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8] hover:underline"
        >
          {labels.backToJobs}
        </Link>
      </div>

      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#DCEBFF] bg-[#F5F9FC]">
              {application.user?.avatar ? (
                <Image src={application.user.avatar} alt="" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#006EA8]">
                  {(applicantName || "?").charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-[24px] font-bold text-[#032C44]">{applicantName || labels.unknownCandidate}</h1>
              <p className="mt-1 text-sm text-[#525252]">{location || "—"}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{jobTitle}</p>
              {userProfileHref ? (
                <Link
                  href={userProfileHref}
                  className="mt-2 inline-flex text-xs font-semibold text-[#006EA8] hover:underline"
                >
                  {isAr ? "عرض ملف مقدم الخدمة" : "View applicant profile"}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DashboardStatusBadge status={status} locale={locale} />
            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#006EA8] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,110,168,0.28)] transition hover:bg-[#005685]"
              >
                <CloudDownload className="h-4 w-4" aria-hidden />
                {labels.downloadCv}
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 border-b border-[#E5E7EB]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "pb-3 text-sm font-semibold transition",
                activeTab === tab.key
                  ? "border-b-2 border-[#006EA8] text-[#006EA8]"
                  : "text-[#6B7280] hover:text-[#006EA8]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: labels.dateOfBirth, value: formatDate(profile?.dateOfBirth || undefined, locale) },
                {
                  label: labels.age,
                  value: calcAge(profile?.dateOfBirth) ? `${calcAge(profile?.dateOfBirth)} ${labels.years}` : "—",
                },
                { label: labels.gender, value: formatGender(profile?.gender) },
                { label: labels.maritalStatus, value: formatMaritalStatus(profile?.maritalStatus) },
                {
                  label: labels.category,
                  value: profile?.categoryName || profile?.subcategoryName || application.job?.category?.name || "—",
                },
                { label: labels.languages, value: languageList || "—" },
              ].map((item) => (
                <div key={item.label} className="rounded-[12px] border border-[#E8F2FF] bg-[#F9FBFD] px-4 py-3">
                  <p className="text-xs text-[#6B7280]">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#032C44]">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-4">
              {portfolio.education.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#6B7280]">{labels.noEducation}</p>
              ) : (
                portfolio.education.map((edu: Record<string, unknown>, index: number) => (
                  <div key={index} className="rounded-[12px] border border-[#E8F2FF] bg-[#F9FBFD] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#032C44]">
                          {formatDegree(String(edu.level_of_education || edu.degree || ""))}
                        </h3>
                        <p className="mt-1 text-sm text-[#006EA8]">{String(edu.university || edu.institution || "—")}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#525252]">
                        {String(edu.graduation_year || "—")}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <span className="text-xs text-[#6B7280]">{isAr ? "التخصص" : "Specialization"}</span>
                        <p className="font-semibold text-[#262626]">{String(edu.specialization || "—")}</p>
                      </div>
                      <div>
                        <span className="text-xs text-[#6B7280]">{isAr ? "التقدير" : "Grade"}</span>
                        <p className="font-semibold text-[#262626]">{formatGrade(String(edu.final_grade || ""))}</p>
                      </div>
                    </div>
                    {edu.attachment ? (
                      <div className="mt-3 flex items-center gap-1.5 text-sm text-[#006EA8]">
                        <img src="/portfolio/pdf.svg" alt="attachment" className="w-5 h-5 shrink-0" />
                        <a
                          href={String(edu.attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline truncate max-w-[280px]"
                        >
                          {getFilenameFromUrl(String(edu.attachment))}
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {portfolio.workExperience.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[#6B7280]">{labels.noExperience}</p>
                ) : (
                  portfolio.workExperience.map((exp: Record<string, unknown>, index: number) => (
                    <div key={index} className="rounded-[12px] border border-[#E8F2FF] bg-[#F9FBFD] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-[#032C44]">{String(exp.company_name || exp.company || "—")}</h3>
                          <p className="mt-1 text-sm text-[#006EA8]">{String(exp.department || exp.job_title || "—")}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#525252]">
                          {formatDate(String(exp.start_date || ""), locale)} -{" "}
                          {exp.currently_working ? labels.currentlyWorking : formatDate(String(exp.end_date || ""), locale)}
                        </span>
                      </div>
                      {exp.responsibilities ? (
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#525252]">
                          {String(exp.responsibilities)}
                        </p>
                      ) : null}
                      {exp.attachment ? (
                        <div className="mt-3 flex items-center gap-1.5 text-sm text-[#006EA8]">
                          <img src="/portfolio/pdf.svg" alt="attachment" className="w-5 h-5 shrink-0" />
                          <a
                            href={String(exp.attachment)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:underline truncate max-w-[280px]"
                          >
                            {getFilenameFromUrl(String(exp.attachment))}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-[#032C44]">{isAr ? "المهارات" : "Skills"}</h3>
                {portfolio.skills.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">{labels.noSkills}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill: Record<string, unknown>, index: number) => {
                      const attachment = String(skill.attachment || "").trim() || null
                      const name = String(skill.skill_name || skill.name || "—")
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <span className="rounded-full border border-[#cfe7f7] bg-[#EBF5FB] px-3 py-1.5 text-xs font-bold text-[#006EA8]">
                            {name}
                          </span>
                          {attachment ? (
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#006EA8] hover:underline max-w-[200px] truncate"
                              aria-label={isAr ? `فتح المرفق ${name}` : `Open attachment for ${name}`}
                            >
                              <img src="/portfolio/pdf.svg" alt="attachment" className="w-4 h-4 shrink-0" />
                              {getFilenameFromUrl(attachment)}
                            </a>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-[#E5E7EB] pt-6">
          <CompanyApplicationActions
            applicationId={application.id}
            jobId={jobId}
            locale={locale}
            status={application.status}
          />
        </div>
      </div>
    </div>
  )
}
