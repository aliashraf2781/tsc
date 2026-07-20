import { resolveAppLocale, type AppLocale } from "./company-application-detail-labels"

const DEGREE_LABELS: Record<string, Record<AppLocale, string>> = {
  high_school: { ar: "ثانوية عامة", en: "High School", de: "Abitur / Oberschule" },
  bachelor: { ar: "بكالوريوس", en: "Bachelor", de: "Bachelor-Abschluss" },
  master: { ar: "ماجستير", en: "Master", de: "Master-Abschluss" },
  phd: { ar: "دكتوراه", en: "PhD", de: "Promotion / PhD" },
}

const GRADE_LABELS: Record<string, Record<AppLocale, string>> = {
  excellent: { ar: "ممتاز", en: "Excellent", de: "Sehr gut" },
  very_good: { ar: "جيد جداً", en: "Very Good", de: "Gut" },
  good: { ar: "جيد", en: "Good", de: "Befriedigend" },
  pass: { ar: "مقبول", en: "Pass", de: "Ausreichend" },
}

const LANGUAGE_LEVEL_LABELS: Record<string, Record<AppLocale, string>> = {
  beginner: { ar: "مبتدئ", en: "Beginner", de: "Anfänger" },
  intermediate: { ar: "متوسط", en: "Intermediate", de: "Mittelstufe" },
  fluent: { ar: "طلاقة", en: "Fluent", de: "Fließend" },
  native: { ar: "اللغة الأم", en: "Native", de: "Muttersprache" },
}

export function getDegreeLabel(degree: string | null | undefined, locale?: string): string {
  const key = String(degree || "").toLowerCase()
  return DEGREE_LABELS[key]?.[resolveAppLocale(locale)] ?? degree ?? "—"
}

export function getGradeLabel(grade: string | null | undefined, locale?: string): string {
  const key = String(grade || "").toLowerCase()
  return GRADE_LABELS[key]?.[resolveAppLocale(locale)] ?? grade ?? "—"
}

export function getLanguageLevelLabel(level: string | null | undefined, locale?: string): string {
  const key = String(level || "").trim().toLowerCase()
  return LANGUAGE_LEVEL_LABELS[key]?.[resolveAppLocale(locale)] ?? level ?? ""
}

export function getGenderLabel(gender: string | null | undefined, labels: { male: string; female: string }): string {
  const value = String(gender || "").toLowerCase()
  if (value.includes("female") || value.includes("أنثى")) return labels.female
  if (value.includes("male") || value.includes("ذكر")) return labels.male
  return gender || "—"
}

export function getMaritalStatusLabel(
  status: string | null | undefined,
  labels: { single: string; married: string }
): string {
  const value = String(status || "").toLowerCase()
  if (value === "single" || value === "أعزب") return labels.single
  if (value === "married" || value === "متزوج") return labels.married
  return status || "—"
}
