export type LanguageLevel = "beginner" | "intermediate" | "fluent" | "native"

export type EducationLevel = "high_school" | "bachelor" | "master" | "phd"

export type FinalGrade = "excellent" | "very_good" | "good" | "pass"

export type LanguageItem = {
  id?: number
  tempId?: string
  language: string
  level: LanguageLevel
}

export type EducationItem = {
  id?: number
  tempId?: string
  university: string
  levelOfEducation: EducationLevel
  graduationYear: string
  specialization: string
  finalGrade: FinalGrade
  attachment?: string | null
  attachmentFile?: File | null
}

export type ExperienceItem = {
  id?: number
  tempId?: string
  companyName: string
  department: string
  startDate: string
  endDate?: string
  currentlyWorking: boolean
  responsibilities: string
  attachment?: string | null
  attachmentFile?: File | null
}

export type SkillItem = {
  id?: number
  tempId?: string
  skillName: string
}

export type PortfolioData = {
  cv: string | null
  languages: LanguageItem[]
  educations: EducationItem[]
  experiences: ExperienceItem[]
  skills: SkillItem[]
}
