import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/auth-token"
import { getMyApplicationDetail } from "@/lib/api/services/user.service"
import { getUserPortfolio } from "@/lib/api/services/portfolio.service"
import { getProfile } from "@/lib/api/services/auth.service"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { getCompanyLogo } from "@/features/jobs/lib/job-display"
import { Card } from "@/components/ui/card"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"

function formatDate(date: string | undefined, locale: string) {
  if (!date) return "—"
  try {
    const formatter =
      locale === "ar"
        ? new Intl.DateTimeFormat("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : locale === "de"
          ? new Intl.DateTimeFormat("de-DE", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Intl.DateTimeFormat("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })

    return formatter.format(new Date(date))
  } catch {
    return "—"
  }
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const isAr = locale === "ar"
  const isDe = locale === "de"

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const applicationId = Number(id)
  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    redirect(`/${locale}/dashboard/user/applications`)
  }

  let application: any = null
  let portfolio: any = null
  let userProfile: any = null

  try {
    const [appDetail, portResult, profResult] = await Promise.all([
      getMyApplicationDetail(session.accessToken, applicationId, locale as "ar" | "en" | "de"),
      getUserPortfolio(session.accessToken, locale).catch(() => undefined),
      getProfile(session.accessToken, locale).catch(() => undefined),
    ])
    application = appDetail
    portfolio = portResult
    userProfile = profResult
  } catch (err) {
    console.error("[ApplicationDetail] fetch error:", err)
  }

  if (!application) {
    const gradientClasses = cn(
      "bg-clip-text text-transparent font-bold",
      isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
      "from-[#032C44] to-[#41A0CA]"
    )

    return (
      <div className="flex w-full flex-col gap-6 text-start">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
          <div className="min-w-0 flex-1">
            <h1 className={cn("text-[24px] leading-relaxed py-1", gradientClasses)}>
              {isAr ? "تفاصيل الطلب" : isDe ? "Bewerbungsdetails" : "Application Details"}
            </h1>
          </div>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
          <img src="/portfolio/drop.svg" alt="" className="w-16 h-16 mx-auto opacity-40 mb-4" />
          <p className="text-gray-500 font-medium">
            {isAr ? "لم يتم العثور على هذا الطلب" : isDe ? "Bewerbung nicht gefunden" : "Application not found"}
          </p>
          <Link
            href="/dashboard/user/applications"
            className="inline-block mt-4 text-xs font-bold text-[#006EA8] hover:underline"
          >
            {isAr ? "العودة إلى الطلبات" : isDe ? "Zurück zu Bewerbungen" : "Back to Applications"}
          </Link>
        </div>
      </div>
    )
  }

  const labels = {
    title: isAr ? "تفاصيل الطلب" : isDe ? "Bewerbungsdetails" : "Application Details",
    jobTitle: isAr ? "عنوان الوظيفة" : isDe ? "Stellentitel" : "Job Title",
    company: isAr ? "الشركة" : isDe ? "Unternehmen" : "Company",
    status: isAr ? "الحالة" : isDe ? "Status" : "Status",
    appliedOn: isAr ? "تاريخ التقديم" : isDe ? "Beworben am" : "Applied On",
    cvUrl: isAr ? "السيرة الذاتية" : isDe ? "Lebenslauf" : "CV",
    backToApplications: isAr ? "العودة إلى الطلبات" : isDe ? "Zurück zu Bewerbungen" : "Back to Applications",
    viewJob: isAr ? "عرض الوظيفة" : isDe ? "Stelle anzeigen" : "View Job",
    download: isAr ? "تحميل" : isDe ? "Herunterladen" : "Download",
    location: isAr ? "الموقع" : isDe ? "Ort" : "Location",
    employmentType: isAr ? "نوع التوظيف" : isDe ? "Anstellungsart" : "Employment Type",
    salary: isAr ? "الراتب" : isDe ? "Gehalt" : "Salary",
    jobDetails: isAr ? "تفاصيل الوظيفة" : isDe ? "Stellendetails" : "Job Details",
    personalDetails: isAr ? "البيانات الشخصية" : isDe ? "Persönliche Daten" : "Personal Details",
    name: isAr ? "الاسم" : isDe ? "Name" : "Name",
    email: isAr ? "البريد الإلكتروني" : isDe ? "E-Mail" : "Email",
    phone: isAr ? "رقم الهاتف" : isDe ? "Telefonnummer" : "Phone",
    gender: isAr ? "الجنس" : isDe ? "Geschlecht" : "Gender",
    dateOfBirth: isAr ? "تاريخ الميلاد" : isDe ? "Geburtsdatum" : "Date of Birth",
    maritalStatus: isAr ? "الحالة الاجتماعية" : isDe ? "Familienstand" : "Marital Status",
    male: isAr ? "ذكر" : isDe ? "Männlich" : "Male",
    female: isAr ? "أنثى" : isDe ? "Weiblich" : "Female",
    single: isAr ? "أعزب" : isDe ? "Ledig" : "Single",
    married: isAr ? "متزوج" : isDe ? "Verheiratet" : "Married",
    cv: isAr ? "السيرة الذاتية المرفقة" : isDe ? "Beigefügter Lebenslauf" : "Attached CV",
    noCv: isAr ? "لا توجد سيرة ذاتية مرفوعة" : isDe ? "Kein Lebenslauf hochgeladen" : "No CV uploaded",
    education: isAr ? "التعليم والمؤهلات" : isDe ? "Ausbildung" : "Education",
    noEducation: isAr ? "لا توجد مؤهلات تعليمية مضافة" : isDe ? "Bisher keine Ausbildung hinzugefügt" : "No education added yet",
    experience: isAr ? "الخبرة المهنية" : isDe ? "Berufserfahrung" : "Work Experience",
    noExperience: isAr ? "لا توجد خبرات مهنية مضافة" : isDe ? "Bisher keine Berufserfahrung hinzugefügt" : "No work experience added yet",
    skills: isAr ? "المهارات" : isDe ? "Fähigkeiten" : "Skills",
    noSkills: isAr ? "لا توجد مهارات مضافة" : isDe ? "Bisher keine Fähigkeiten hinzugefügt" : "No skills added yet",
    languages: isAr ? "اللغات" : isDe ? "Sprachen" : "Languages",
    noLanguages: isAr ? "لا توجد لغات مضافة" : isDe ? "Bisher keine Sprachen hinzugefügt" : "No languages added yet",
    year: isAr ? "سنة التخرج" : isDe ? "Abschlussjahr" : "Graduation Year",
    grade: isAr ? "التقدير" : isDe ? "Note" : "Grade",
  }

  const getEduLevelLabel = (level: string) => {
    const map: Record<string, string> = {
      high_school: isAr ? "ثانوية عامة" : isDe ? "Abitur / Oberschule" : "High School",
      bachelor: isAr ? "بكالوريوس" : isDe ? "Bachelor-Abschluss" : "Bachelor's Degree",
      master: isAr ? "ماجستير" : isDe ? "Master-Abschluss" : "Master's Degree",
      phd: isAr ? "دكتوراه" : isDe ? "Promotion / PhD" : "PhD",
    }
    return map[level] || level
  }

  const getGradeLabel = (grd: string) => {
    const map: Record<string, string> = {
      excellent: isAr ? "ممتاز" : isDe ? "Sehr gut / Ausgezeichnet" : "Excellent",
      very_good: isAr ? "جيد جداً" : isDe ? "Gut" : "Very Good",
      good: isAr ? "جيد" : isDe ? "Befriedigend" : "Good",
      pass: isAr ? "مقبول" : isDe ? "Ausreichend" : "Pass",
    }
    return map[grd] || grd
  }

  const getGraduationYear = (edu: any) => {
    const candidates = [
      edu.graduation_year,
      edu.graduationYear,
      edu.end_date,
      edu.start_date,
      edu.endDate,
      edu.startDate,
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

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-[#FFF8EE]", text: "text-[#FFB64D]", border: "border-[#FFB64D]" },
    accepted: { bg: "bg-[#EAFBF3]", text: "text-[#39DA8A]", border: "border-[#39DA8A]" },
    approved: { bg: "bg-[#F3E8FF]", text: "text-[#9333CD]", border: "border-[#D8B4FE]" },
    rejected: { bg: "bg-[#FFF5F5]", text: "text-[#FF5B5C]", border: "border-[#FF5B5C]" },
    reviewed: { bg: "bg-[#EFF6FF]", text: "text-[#1E40AF]", border: "border-[#BFDBFE]" },
    stopped: { bg: "bg-[#F3F4F6]", text: "text-[#4B5563]", border: "border-[#D1D5DB]" },
  }

  const statusLabels: Record<string, string> = {
    pending: isAr ? "قيد المراجعة" : isDe ? "Ausstehend" : "Pending",
    accepted: isAr ? "مقبول" : isDe ? "Akzeptiert" : "Accepted",
    approved: isAr ? "مقبول" : isDe ? "Freigegeben" : "Approved",
    rejected: isAr ? "مرفوض" : isDe ? "Abgelehnt" : "Rejected",
    reviewed: isAr ? "تمت المراجعة" : isDe ? "Überprüft" : "Reviewed",
    stopped: isAr ? "موقوفة" : isDe ? "Gestoppt" : "Stopped",
  }

  const jobTitle = application.job
    ? getJobTitle(application.job, locale as "ar" | "en" | "de")
    : "—"
  const companyName = application.job?.company?.name || "—"
  const status = application.status || "pending"
  const statusStyle = statusColors[status] || statusColors.pending

  const gradientClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return ""
    return url.substring(url.lastIndexOf("/") + 1)
  }

  return (
    <div
      className="flex w-full flex-col gap-6 text-start"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <div className="min-w-0 flex-1">
          <h1 className={cn("text-[24px] leading-relaxed py-1", gradientClasses)}>
            {labels.title}
          </h1>
          <p className="mt-1 text-sm text-[#525252]">
            {isAr ? "عرض تفاصيل طلب التقديم على الوظيفة" : isDe ? "Details Ihrer Bewerbung anzeigen" : "View your job application details"}
          </p>
        </div>
        <Link
          href="/dashboard/user/applications"
          className="flex items-center gap-2 px-5 py-2.5 border border-[#006EA8] text-[#006EA8] hover:bg-[#F0F9FF] rounded-[8px] text-[14px] font-semibold transition"
        >
          <span aria-hidden>{isAr ? "→" : isDe ? "→" : "←"}</span>
          {labels.backToApplications}
        </Link>
      </div>

      {/* Main Details Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Job & Application Overview (2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Application Details Card */}
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="space-y-6">
              
              {/* Job Title & Company Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
                <div className="space-y-2">
                  <h2 className="text-[22px] font-bold text-[#032C44]">{jobTitle}</h2>
                  <div className="flex items-center gap-2">
                    {getCompanyLogo(application.job?.company) && (
                      <img
                        src={getCompanyLogo(application.job?.company)!}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-gray-100"
                      />
                    )}
                    <span className="text-[15px] text-[#6B7280] font-medium">{companyName}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={cn(
                    "self-start px-4 py-1.5 rounded-full text-[12px] font-bold border",
                    statusStyle.bg,
                    statusStyle.text,
                    statusStyle.border
                  )}
                >
                  {statusLabels[status]}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Applied On */}
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
                    {labels.appliedOn}
                  </p>
                  <div className="flex items-center gap-2 text-[#032C44]">
                    <img src="/portfolio/calender.svg" alt="" className="w-4 h-4 opacity-60" />
                    <span className="font-medium">{formatDate(application.applied_at, locale)}</span>
                  </div>
                </div>

                {/* Status Text */}
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
                    {labels.status}
                  </p>
                  <p className="font-medium text-[#032C44]">{statusLabels[status]}</p>
                </div>
              </div>

              {/* View Job Button */}
              <div className="flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row">
                {application.job?.id && (
                  <Link
                    href={`/jobs/${application.job.id}`}
                    className="inline-flex items-center justify-center h-[44px] px-6 bg-gradient-to-b from-[#006EA8] to-[#005685] text-white font-bold rounded-[12px] text-[14px] transition hover:brightness-105 shadow-[inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF] w-full sm:w-auto"
                  >
                    {labels.viewJob}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Education History */}
          <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
            <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.education}
            </h2>
            {portfolio?.educations && portfolio.educations.length > 0 ? (
              <div className="space-y-4">
                {portfolio.educations.map((edu: any, idx: number) => (
                  <div key={idx} className="border-b border-[#E5E7EB] last:border-0 pb-4 last:pb-0">
                    <h3 className="text-[15px] font-bold text-[#032C44]">
                      {getEduLevelLabel(edu.degree || edu.level_of_education)}
                    </h3>
                    <p className="text-xs text-[#006EA8] font-bold mt-1">
                      {edu.institution || edu.university} • {edu.field_of_study || edu.specialization}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium mt-2">
                      <span>
                        {labels.year}: <span className="text-[#032C44] font-bold">{getGraduationYear(edu)}</span>
                      </span>
                      {(edu.grade || edu.final_grade) ? (
                        <span>
                          {labels.grade}: <span className="text-[#032C44] font-bold">{getGradeDisplay(edu)}</span>
                        </span>
                      ) : null}
                    </div>
                    {edu.document_url && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#006EA8]">
                        <img src="/portfolio/pdf.svg" alt="PDF" className="w-5 h-5 shrink-0" />
                        <a
                          href={edu.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline truncate max-w-[250px]"
                        >
                          {getFilenameFromUrl(edu.document_url)}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm font-medium">
                {labels.noEducation}
              </div>
            )}
          </Card>

          {/* Work Experience */}
          <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
            <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.experience}
            </h2>
            {portfolio?.experiences && portfolio.experiences.length > 0 ? (
              <div className="space-y-4">
                {portfolio.experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="border-b border-[#E5E7EB] last:border-0 pb-4 last:pb-0">
                    <h3 className="text-[15px] font-bold text-[#032C44]">{exp.job_title || exp.department}</h3>
                    <p className="text-xs text-[#006EA8] font-bold mt-1">
                      {exp.company || exp.company_name}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      {exp.start_date} - {exp.is_current || exp.currently_working ? (isAr ? "حتى الآن" : isDe ? "Gegenwart" : "Present") : exp.end_date || ""}
                    </p>
                    {exp.document_url && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#006EA8]">
                        <img src="/portfolio/pdf.svg" alt="PDF" className="w-5 h-5 shrink-0" />
                        <a
                          href={exp.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline truncate max-w-[250px]"
                        >
                          {getFilenameFromUrl(exp.document_url)}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm font-medium">
                {labels.noExperience}
              </div>
            )}
          </Card>

        </div>

        {/* Right Side: Candidate Details & Skills/Langs (1 col) */}
        <div className="space-y-6">
          
          {/* Candidate Profile Info */}
          {userProfile && (
            <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
              <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
                {labels.personalDetails}
              </h2>
              <div className="space-y-3">
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
                ] as { label: string; value: string }[]).map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5 rounded-[10px] border border-[#E8F2FF] bg-[#F9FBFD] px-4 py-3">
                    <span className="text-[11px] text-[#6B7280]">{item.label}</span>
                    <span className="text-sm font-semibold text-[#032C44] break-all">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Attached CV */}
          <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
            <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.cv}
            </h2>
            {(() => {
              const cvUrl = application.cv_url || portfolio?.cv_url
              return cvUrl ? (
                <div className="flex items-center gap-3 border border-[#E5E7EB] rounded-[12px] p-4 bg-[#F4FAFF]">
                  <img src="/portfolio/pdf.svg" alt="PDF" className="w-10 h-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#032C44] truncate">
                      {getFilenameFromUrl(cvUrl)}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">PDF Document</p>
                  </div>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#006EA8] hover:underline"
                  >
                    {isAr ? "عرض" : isDe ? "Ansehen" : "View"}
                  </a>
                </div>
              ) : (
                <div className="text-center py-2 text-gray-400 text-sm font-medium">
                  {labels.noCv}
                </div>
              )
            })()}
          </Card>

          {/* Skills */}
          <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
            <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.skills}
            </h2>
            {portfolio?.skills && portfolio.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="bg-[#F4FAFF] text-[#006EA8] border border-[#E5F2FF] px-3 py-1.5 rounded-full text-xs font-bold"
                  >
                    {skill.name || skill.skill_name || skill.skillName || ""}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-gray-400 text-sm font-medium">
                {labels.noSkills}
              </div>
            )}
          </Card>

          {/* Languages */}
          <Card className="p-6 border-[#E5E7EB] rounded-[16px] shadow-sm">
            <h2 className="text-[17px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.languages}
            </h2>
            {portfolio?.languages && portfolio.languages.length > 0 ? (
              <div className="space-y-2.5">
                {portfolio.languages.map((lang: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between border border-[#E5E7EB] rounded-[12px] px-3.5 py-2.5 bg-[#F9FAFB]">
                    <span className="text-sm font-bold text-[#032C44]">
                      {lang.name || lang.language || ""}
                    </span>
                    <span className="bg-[#EBF5FF] text-[#006EA8] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {lang.proficiency || lang.level || ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-gray-400 text-sm font-medium">
                {labels.noLanguages}
              </div>
            )}
          </Card>

        </div>

      </div>

    </div>
  )
}
