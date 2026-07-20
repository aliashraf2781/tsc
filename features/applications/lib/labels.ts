import type { AppLocale } from "./types"

const STRINGS = {
  title: { ar: "تفاصيل الطلب", en: "Application Details", de: "Bewerbungsdetails" },
  subtitle: {
    ar: "عرض تفاصيل طلب التقديم على الوظيفة",
    en: "View your job application details",
    de: "Details Ihrer Bewerbung anzeigen",
  },
  notFound: { ar: "لم يتم العثور على هذا الطلب", en: "Application not found", de: "Bewerbung nicht gefunden" },
  jobTitle: { ar: "عنوان الوظيفة", en: "Job Title", de: "Stellentitel" },
  company: { ar: "الشركة", en: "Company", de: "Unternehmen" },
  status: { ar: "الحالة", en: "Status", de: "Status" },
  appliedOn: { ar: "تاريخ التقديم", en: "Applied On", de: "Beworben am" },
  backToApplications: { ar: "العودة إلى الطلبات", en: "Back to Applications", de: "Zurück zu Bewerbungen" },
  viewJob: { ar: "عرض الوظيفة", en: "View Job", de: "Stelle anzeigen" },
  view: { ar: "عرض", en: "View", de: "Ansehen" },
  personalDetails: { ar: "البيانات الشخصية", en: "Personal Details", de: "Persönliche Daten" },
  name: { ar: "الاسم", en: "Name", de: "Name" },
  email: { ar: "البريد الإلكتروني", en: "Email", de: "E-Mail" },
  phone: { ar: "رقم الهاتف", en: "Phone", de: "Telefonnummer" },
  gender: { ar: "الجنس", en: "Gender", de: "Geschlecht" },
  dateOfBirth: { ar: "تاريخ الميلاد", en: "Date of Birth", de: "Geburtsdatum" },
  male: { ar: "ذكر", en: "Male", de: "Männlich" },
  female: { ar: "أنثى", en: "Female", de: "Weiblich" },
  cv: { ar: "السيرة الذاتية المرفقة", en: "Attached CV", de: "Beigefügter Lebenslauf" },
  noCv: { ar: "لا توجد سيرة ذاتية مرفوعة", en: "No CV uploaded", de: "Kein Lebenslauf hochgeladen" },
  pdfDocument: { ar: "مستند PDF", en: "PDF Document", de: "PDF-Dokument" },
  education: { ar: "التعليم والمؤهلات", en: "Education", de: "Ausbildung" },
  noEducation: {
    ar: "لا توجد مؤهلات تعليمية مضافة",
    en: "No education added yet",
    de: "Bisher keine Ausbildung hinzugefügt",
  },
  experience: { ar: "الخبرة المهنية", en: "Work Experience", de: "Berufserfahrung" },
  noExperience: {
    ar: "لا توجد خبرات مهنية مضافة",
    en: "No work experience added yet",
    de: "Bisher keine Berufserfahrung hinzugefügt",
  },
  present: { ar: "حتى الآن", en: "Present", de: "Gegenwart" },
  skills: { ar: "المهارات", en: "Skills", de: "Fähigkeiten" },
  noSkills: { ar: "لا توجد مهارات مضافة", en: "No skills added yet", de: "Bisher keine Fähigkeiten hinzugefügt" },
  languages: { ar: "اللغات", en: "Languages", de: "Sprachen" },
  noLanguages: {
    ar: "لا توجد لغات مضافة",
    en: "No languages added yet",
    de: "Bisher keine Sprachen hinzugefügt",
  },
  year: { ar: "سنة التخرج", en: "Graduation Year", de: "Abschlussjahr" },
  grade: { ar: "التقدير", en: "Note", de: "Grade" },
} as const satisfies Record<string, Record<AppLocale, string>>

export type ApplicationDetailLabels = { [K in keyof typeof STRINGS]: string }

export function getApplicationDetailLabels(locale: AppLocale): ApplicationDetailLabels {
  return Object.fromEntries(
    Object.entries(STRINGS).map(([key, value]) => [key, value[locale]])
  ) as ApplicationDetailLabels
}
