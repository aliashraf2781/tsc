import type { Education } from "@/lib/api/types"
import type { AppLocale } from "./types"

const EDUCATION_LEVEL_LABELS: Record<string, Record<AppLocale, string>> = {
  high_school: { ar: "ثانوية عامة", en: "High School", de: "Abitur / Oberschule" },
  bachelor: { ar: "بكالوريوس", en: "Bachelor's Degree", de: "Bachelor-Abschluss" },
  master: { ar: "ماجستير", en: "Master's Degree", de: "Master-Abschluss" },
  phd: { ar: "دكتوراه", en: "PhD", de: "Promotion / PhD" },
}

const GRADE_LABELS = {
  excellent: { ar: "ممتاز", en: "Excellent", de: "Sehr gut / Ausgezeichnet" },
  very_good: { ar: "جيد جداً", en: "Very Good", de: "Gut" },
  good: { ar: "جيد", en: "Good", de: "Befriedigend" },
  pass: { ar: "مقبول", en: "Pass", de: "Ausreichend" },
} as const satisfies Record<string, Record<AppLocale, string>>

type GradeTier = keyof typeof GRADE_LABELS

export function getEducationLevelLabel(level: string, locale: AppLocale): string {
  return EDUCATION_LEVEL_LABELS[level]?.[locale] ?? level
}

function getGradeTier(grade: number): GradeTier {
  if (grade >= 85) return "excellent"
  if (grade >= 75) return "very_good"
  if (grade >= 65) return "good"
  return "pass"
}

/** `end_date`/`start_date` are normalized to `YYYY-MM-DD`; take the year part. */
export function getGraduationYear(education: Education): string {
  const date = education.end_date || education.start_date
  return date ? date.split("-")[0] : ""
}

export function getGradeDisplay(education: Education, locale: AppLocale): string {
  if (education.grade == null) return ""
  return GRADE_LABELS[getGradeTier(education.grade)][locale]
}
