"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"
import type { Job, User, UserPortfolio } from "@/lib/api/types"

type JobApplicationClientProps = {
  jobId: number
  locale: string
  job: Job
  initialPortfolio?: UserPortfolio
  userProfile?: User
  token: string
}

export default function JobApplicationClient({
  jobId,
  locale,
  job,
  initialPortfolio,
  userProfile,
}: JobApplicationClientProps) {
  const router = useRouter()
  const isAr = locale === "ar"
  const [submitting, setSubmitting] = useState(false)

  const getJobTitle = (job: Job) => {
    if (typeof job.title === "string") return job.title
    if (typeof job.title === "object" && job.title) {
      return job.title[locale as keyof typeof job.title] || job.title.en || job.title.ar || ""
    }
    return ""
  }

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return ""
    return url.substring(url.lastIndexOf("/") + 1)
  }

  const getEduLevelLabel = (level: string) => {
    const map: Record<string, string> = {
      high_school: isAr ? "ثانوية عامة" : "High School",
      bachelor: isAr ? "بكالوريوس" : "Bachelor's Degree",
      master: isAr ? "ماجستير" : "Master's Degree",
      phd: isAr ? "دكتوراه" : "PhD",
    }
    return map[level] || level
  }

  const getGradeLabel = (grd: string) => {
    const map: Record<string, string> = {
      excellent: isAr ? "ممتاز" : "Excellent",
      very_good: isAr ? "جيد جداً" : "Very Good",
      good: isAr ? "جيد" : "Good",
      pass: isAr ? "مقبول" : "Pass",
    }
    return map[grd] || grd
  }

  const getGraduationYear = (edu: any) => {
    // Support multiple possible shapes coming from different portfolio sources
    const candidates = [
      edu.graduation_year,
      (edu as any).graduationYear,
      edu.end_date,
      edu.start_date,
      (edu as any).endDate,
      (edu as any).startDate,
    ]

    for (const c of candidates) {
      if (!c && c !== 0) continue
      const s = String(c)
      if (!s) continue
      if (s.includes("-")) return s.split("-")[0]
      return s
    }

    return ""
  }

  const getGradeDisplay = (edu: any) => {
    const val = edu.final_grade || edu.grade
    if (!val) return ""
    if (typeof val === "number" || !isNaN(Number(val))) {
      const num = Number(val)
      if (num >= 85) return getGradeLabel("excellent")
      if (num >= 75) return getGradeLabel("very_good")
      if (num >= 65) return getGradeLabel("good")
      return getGradeLabel("pass")
    }
    return getGradeLabel(String(val))
  }

  const handleApply = async () => {
    if (submitting) return
    setSubmitting(true)

    const toastId = toast.loading(isAr ? "جاري التقديم..." : "Submitting...")

    try {
      // Pre-check: ensure there's no existing open/pending application for this job
      try {
        const chk = await fetch(`/api/jobs/${jobId}/has-open-application`, { headers: { "x-locale": locale } })
        if (chk.ok) {
          const body = await chk.json().catch(() => ({}))
          if (body?.hasOpen) {
            toast.dismiss(toastId)
            toast.error(isAr ? "لديك طلب مفتوح لهذه الوظيفة. الرجاء إغلاقه أولاً." : "You already have an open application for this job. Please close it first.")
            setSubmitting(false)
            return
          }
        }
      } catch (e) {
        // If pre-check fails for network reasons, continue and let server handle duplicates
        console.warn("Pre-check for open application failed:", e)
      }

      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-locale": locale,
        },
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || (isAr ? "فشل تقديم الطلب" : "Failed to apply"))
      }

      toast.dismiss(toastId)
      toast.success(isAr ? "تم تقديم طلبك بنجاح!" : "Your application has been submitted successfully!")

      // Redirect to user applications
      setTimeout(() => {
        router.push("/dashboard/user/applications")
      }, 1500)
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err.message || (isAr ? "فشل التقديم، تأكد من إكمال ملفك الشخصي أولاً" : "Failed to apply. Make sure your profile is complete."))
      console.error("Job application error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const labels = {
    title: isAr ? "تأكيد التقديم على الوظيفة" : "Confirm Job Application",
    subtitle: isAr
      ? "سيتم إرسال طلبك باستخدام بيانات سيرتك الذاتية والمؤهلات المسجلة في حسابك أدناه:"
      : "Your application will be submitted using the CV and qualifications registered under your account below:",
    cv: isAr ? "السيرة الذاتية" : "CV",
    noCv: isAr ? "لا توجد سيرة ذاتية مرفوعة" : "No CV uploaded",
    education: isAr ? "التعليم والمؤهلات" : "Education",
    noEducation: isAr ? "لا توجد مؤهلات تعليمية مضافة" : "No education added yet",
    experience: isAr ? "الخبرة المهنية" : "Work Experience",
    noExperience: isAr ? "لا توجد خبرات مهنية مضافة" : "No work experience added yet",
    skills: isAr ? "المهارات" : "Skills",
    noSkills: isAr ? "لا توجد مهارات مضافة" : "No skills added yet",
    languages: isAr ? "اللغات" : "Languages",
    noLanguages: isAr ? "لا توجد لغات مضافة" : "No languages added yet",
    updateNote: isAr
      ? "لتعديل أو إضافة أي بيانات إلى ملفك، يرجى الانتقال إلى"
      : "To edit or add any details to your profile, please go to",
    updateLink: isAr ? "صفحة تعديل السيرة الذاتية" : "CV & Education edit page",
    confirmQuestion: isAr
      ? "هل أنت متأكد من رغبتك في التقديم على هذه الوظيفة ببياناتك الحالية؟"
      : "Are you sure you want to apply to this job with your current details?",
    confirmBtn: isAr ? "تأكيد وتقديم الطلب" : "Confirm & Apply",
    cancelBtn: isAr ? "إلغاء" : "Cancel",
    level: isAr ? "المستوى" : "Level",
    university: isAr ? "الجامعة" : "University",
    year: isAr ? "سنة التخرج" : "Graduation Year",
    grade: isAr ? "التقدير" : "Grade",
    company: isAr ? "الشركة" : "Company",
    department: isAr ? "القسم" : "Department",
    period: isAr ? "الفترة" : "Period",
    personalDetails: isAr ? "البيانات الشخصية" : "Personal Details",
    name: isAr ? "الاسم" : "Name",
    email: isAr ? "البريد الإلكتروني" : "Email",
    phone: isAr ? "رقم الهاتف" : "Phone",
    gender: isAr ? "الجنس" : "Gender",
    dateOfBirth: isAr ? "تاريخ الميلاد" : "Date of Birth",
    maritalStatus: isAr ? "الحالة الاجتماعية" : "Marital Status",
    male: isAr ? "ذكر" : "Male",
    female: isAr ? "أنثى" : "Female",
    single: isAr ? "أعزب" : "Single",
    married: isAr ? "متزوج" : "Married",
  }

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  const hasPortfolioData = initialPortfolio && 
    (initialPortfolio.cv_url || (initialPortfolio as any).cv ||
     (initialPortfolio.educations && initialPortfolio.educations.length > 0) ||
     ((initialPortfolio as any).education && (initialPortfolio as any).education.length > 0) ||
     (initialPortfolio.experiences && initialPortfolio.experiences.length > 0) ||
     ((initialPortfolio as any).workExperience && (initialPortfolio as any).workExperience.length > 0))

  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen py-10" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[800px] px-4 space-y-6">
        
        {/* Job Info Summary Header */}
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 text-start">
            <h1 className={cn("text-[24px] py-0.5", gradientTitleClasses)}>{labels.title}</h1>
            <p className="text-sm text-gray-500 font-medium">
              {isAr ? "الوظيفة:" : "Job:"} <span className="text-[#032C44] font-bold">{getJobTitle(job)}</span>
            </p>
            {job.company?.name && (
              <p className="text-xs text-gray-400 font-semibold">
                {job.company.name} • {job.state || job.location}
              </p>
            )}
          </div>
          <Link
            href={`/jobs/${jobId}`}
            className="text-xs font-bold text-[#006EA8] hover:underline shrink-0"
          >
            {isAr ? "عرض تفاصيل الوظيفة" : "View Job Details"}
          </Link>
        </div>

        {/* Informative Subtitle */}
        <p className="text-sm text-gray-500 text-start leading-relaxed font-medium px-1">
          {labels.subtitle}
        </p>

        {/* Personal Details Card */}
        {userProfile && (
          <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm text-start">
            <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.personalDetails}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { label: labels.name, value: userProfile.name },
                { label: labels.email, value: userProfile.email },
                { label: labels.phone, value: userProfile.phone || "—" },
                {
                  label: labels.gender,
                  value: (() => {
                    const g = String(userProfile.Userprofile?.gender || "").toLowerCase()
                    if (g.includes("female")) return labels.female
                    if (g.includes("male")) return labels.male
                    return userProfile.Userprofile?.gender || "—"
                  })(),
                },
                {
                  label: labels.dateOfBirth,
                  value: userProfile.Userprofile?.dateOfBirth
                    ? new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(userProfile.Userprofile.dateOfBirth))
                    : "—",
                },
                {
                  label: labels.maritalStatus,
                  value: (() => {
                    const ms = String((userProfile.Userprofile as any)?.maritalStatus || "").toLowerCase()
                    if (ms === "single") return labels.single
                    if (ms === "married") return labels.married
                    return (userProfile.Userprofile as any)?.maritalStatus || "—"
                  })(),
                },
              ] as { label: string; value: string }[]).map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5 rounded-[10px] border border-[#E8F2FF] bg-[#F9FBFD] px-4 py-3">
                  <span className="text-xs text-[#6B7280]">{item.label}</span>
                  <span className="text-sm font-semibold text-[#032C44]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CV File Card */}
        <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm text-start">
          <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
            {labels.cv}
          </h2>
          {initialPortfolio?.cv_url ? (
            <div className="flex items-center gap-3 border border-[#E5E7EB] rounded-[12px] p-4 bg-[#F4FAFF]">
              <img src="/portfolio/pdf.svg" alt="PDF" className="w-10 h-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#032C44] truncate">
                  {getFilenameFromUrl(initialPortfolio.cv_url)}
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">PDF Document</p>
              </div>
              <a
                href={initialPortfolio.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#006EA8] hover:underline"
              >
                {isAr ? "عرض" : "View"}
              </a>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm font-medium">
              {labels.noCv}
            </div>
          )}
        </Card>

        {/* Education History Card */}
        <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm text-start">
          <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
            {labels.education}
          </h2>
          {initialPortfolio?.educations && initialPortfolio.educations.length > 0 ? (
            <div className="space-y-4">
              {initialPortfolio.educations.map((edu, idx) => (
                <div key={idx} className="border-b border-[#E5E7EB] last:border-0 pb-4 last:pb-0">
                  <h3 className="text-[15px] font-bold text-[#032C44]">
                    {getEduLevelLabel(edu.degree || (edu as any).level_of_education)}
                  </h3>
                  <p className="text-xs text-[#006EA8] font-bold mt-1">
                    {edu.institution || (edu as any).university} • {edu.field_of_study || (edu as any).specialization}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium mt-2">
                    <span>
                      {labels.year}: <span className="text-[#032C44] font-bold">{getGraduationYear(edu)}</span>
                    </span>
                    {(edu.grade || (edu as any).final_grade) ? (
                      <span>
                        {labels.grade}: <span className="text-[#032C44] font-bold">{getGradeDisplay(edu)}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm font-medium">
              {labels.noEducation}
            </div>
          )}
        </Card>

        {/* Work Experience Card */}
        <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm text-start">
          <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
            {labels.experience}
          </h2>
          {(() => {
            const exps = initialPortfolio?.experiences || (initialPortfolio as any)?.workExperience
            if (exps && exps.length > 0) {
              return (
                <div className="space-y-4">
                  {exps.map((exp: any, idx: number) => (
                    <div key={idx} className="border-b border-[#E5E7EB] last:border-0 pb-4 last:pb-0">
                      <h3 className="text-[15px] font-bold text-[#032C44]">{exp.job_title || exp.department}</h3>
                      <p className="text-xs text-[#006EA8] font-bold mt-1">
                        {exp.company || exp.company_name}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        {exp.start_date} - {exp.is_current || exp.currently_working || exp.currentlyWorking ? (isAr ? "حتى الآن" : "Present") : exp.end_date || ""}
                      </p>
                    </div>
                  ))}
                </div>
              )
            }
            return (
              <div className="text-center py-4 text-gray-400 text-sm font-medium">
                {labels.noExperience}
              </div>
            )
          })()}
        </Card>

        {/* Skills Card */}
        <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm text-start">
          <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
            {labels.skills}
          </h2>
          {initialPortfolio?.skills && initialPortfolio.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {initialPortfolio.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-[#F4FAFF] text-[#006EA8] border border-[#E5F2FF] px-3.5 py-1.5 rounded-full text-xs font-bold"
                >
                  {skill.name || (skill as any).skill_name || (skill as any).skillName || ""}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm font-medium">
              {labels.noSkills}
            </div>
          )}
        </Card>

        {/* Languages Card */}
        <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm text-start">
          <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
            {labels.languages}
          </h2>
          {initialPortfolio?.languages && initialPortfolio.languages.length > 0 ? (
            <div className="space-y-2.5">
              {initialPortfolio.languages.map((lang, idx) => (
                <div key={idx} className="flex items-center justify-between border border-[#E5E7EB] rounded-[12px] px-4 py-3 bg-[#F9FAFB]">
                  <span className="text-sm font-bold text-[#032C44]">
                    {lang.name || (lang as any).language || ""}
                  </span>
                  <span className="bg-[#EBF5FF] text-[#006EA8] text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                    {lang.proficiency || (lang as any).level || ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm font-medium">
              {labels.noLanguages}
            </div>
          )}
        </Card>

        {/* Profile Update Link Notice */}
        <div className="p-4 rounded-[12px] bg-[#FFF8EE] border border-[#FFE5C4] text-start text-xs text-[#855B14] font-semibold">
          {labels.updateNote}{" "}
          <Link
            href="/dashboard/user/education"
            className="text-[#006EA8] underline font-bold"
          >
            {labels.updateLink}
          </Link>
        </div>

        {/* Final Apply Confirmation Box */}
        <div className="border border-[#E5E7EB] rounded-[16px] bg-white p-6 shadow-sm space-y-5">
          <p className="text-[15px] font-bold text-[#032C44] text-center">
            {labels.confirmQuestion}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push(`/jobs/${jobId}`)}
              disabled={submitting}
              className="w-full sm:w-1/3 h-[44px] border border-[#006EA8] text-[#006EA8] hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition cursor-pointer"
            >
              {labels.cancelBtn}
            </button>
            <PrimaryButton
              onClick={handleApply}
              disabled={submitting}
              className="w-full sm:w-1/2 h-[44px] cursor-pointer"
            >
              {submitting ? (isAr ? "جاري إرسال الطلب..." : "Submitting...") : labels.confirmBtn}
            </PrimaryButton>
          </div>
        </div>

      </div>
    </div>
  )
}
