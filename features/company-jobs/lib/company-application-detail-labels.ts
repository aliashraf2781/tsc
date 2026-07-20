export type AppLocale = "ar" | "en" | "de"

export function resolveAppLocale(locale?: string): AppLocale {
  return locale === "ar" || locale === "de" ? locale : "en"
}

const STRINGS = {
  back: { ar: "العودة إلى الطلبات", en: "Back to Applications", de: "Zurück zu Bewerbungen" },
  backToJobs: { ar: "العودة لكل الوظائف", en: "Back to Jobs", de: "Zurück zu allen Stellen" },
  overview: { ar: "نظرة عامة", en: "Overview", de: "Übersicht" },
  education: { ar: "التعليم", en: "Education", de: "Ausbildung" },
  experience: { ar: "الخبرة والمهارات", en: "Experience And Skills", de: "Erfahrung und Fähigkeiten" },
  downloadCv: { ar: "تحميل السيرة الذاتية", en: "Download CV", de: "Lebenslauf herunterladen" },
  dateOfBirth: { ar: "تاريخ الميلاد", en: "Date Of Birth", de: "Geburtsdatum" },
  age: { ar: "العمر", en: "Age", de: "Alter" },
  gender: { ar: "الجنس", en: "Gender", de: "Geschlecht" },
  maritalStatus: { ar: "الحالة الاجتماعية", en: "Marital Status", de: "Familienstand" },
  category: { ar: "المجال", en: "Category", de: "Bereich" },
  languages: { ar: "اللغات", en: "Language", de: "Sprache" },
  years: { ar: "سنة", en: "Years", de: "Jahre" },
  male: { ar: "ذكر", en: "Male", de: "Männlich" },
  female: { ar: "أنثى", en: "Female", de: "Weiblich" },
  single: { ar: "أعزب", en: "Single", de: "Ledig" },
  married: { ar: "متزوج", en: "Married", de: "Verheiratet" },
  noEducation: { ar: "لا توجد مؤهلات تعليمية", en: "No education records", de: "Keine Ausbildungsnachweise" },
  noExperience: { ar: "لا توجد خبرات مهنية", en: "No work experience", de: "Keine Berufserfahrung" },
  noSkills: { ar: "لا توجد مهارات", en: "No skills added", de: "Keine Fähigkeiten hinzugefügt" },
  currentlyWorking: { ar: "حتى الآن", en: "Present", de: "Bis heute" },
  unknownCandidate: { ar: "متقدم غير مسمى", en: "Unnamed candidate", de: "Unbenannter Bewerber" },
  appliedOn: { ar: "تاريخ التقديم", en: "Applied on", de: "Beworben am" },
  jobStatus: { ar: "حالة الوظيفة", en: "Job status", de: "Stellenstatus" },
  specialization: { ar: "التخصص", en: "Specialization", de: "Fachrichtung" },
  grade: { ar: "التقدير", en: "Grade", de: "Note" },
  skills: { ar: "المهارات", en: "Skills", de: "Fähigkeiten" },
  viewApplicantProfile: { ar: "عرض ملف مقدم الخدمة", en: "View applicant profile", de: "Bewerberprofil ansehen" },
} as const satisfies Record<string, Record<AppLocale, string>>

export type CompanyApplicationDetailLabels = { [K in keyof typeof STRINGS]: string }

export function getCompanyApplicationDetailLabels(locale?: string): CompanyApplicationDetailLabels {
  const appLocale = resolveAppLocale(locale)
  return Object.fromEntries(
    Object.entries(STRINGS).map(([key, value]) => [key, value[appLocale]])
  ) as CompanyApplicationDetailLabels
}
