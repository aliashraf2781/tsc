import type {
  EducationItem,
  ExperienceItem,
  LanguageItem,
  PortfolioData,
  SkillItem,
} from "../types/portfolio.types"

// Upstream field names vary between raw and normalized shapes (camelCase vs
// snake_case, nested vs flat), so every field is read defensively here.
export function mapPortfolioFromBackend(data: any): PortfolioData {
  const cv: string | null = data.cv || data.cv_url || null

  const languages: LanguageItem[] = (data.languages || []).map((l: any) => ({
    id: l.id,
    language: l.language || l.name || "",
    level: l.level || l.proficiency || "beginner",
  }))

  const educations: EducationItem[] = (data.education || data.educations || []).map((e: any) => {
    const university = e.university || e.institution || ""
    const levelOfEducation = e.levelOfEducation || e.level_of_education || e.degree || "bachelor"

    let graduationYear = String(e.graduationYear || e.graduation_year || "")
    if (!graduationYear && e.end_date) {
      graduationYear = String(new Date(e.end_date).getFullYear())
    }
    if (graduationYear === "NaN") graduationYear = ""

    const specialization = e.specialization || e.field_of_study || ""

    let finalGrade = e.finalGrade || e.final_grade || "good"
    if (typeof e.grade === "number") {
      finalGrade =
        e.grade >= 85 ? "excellent" : e.grade >= 75 ? "very_good" : e.grade >= 65 ? "good" : "pass"
    }

    return {
      id: e.id,
      university,
      levelOfEducation,
      graduationYear,
      specialization,
      finalGrade,
      attachment: e.attachment || e.document_url || null,
    }
  })

  const experiences: ExperienceItem[] = (data.workExperience || data.experiences || []).map((e: any) => ({
    id: e.id,
    companyName: e.companyName || e.company_name || e.company || "",
    department: e.department || e.job_title || "",
    startDate: e.startDate || e.start_date || "",
    endDate: e.endDate || e.end_date || "",
    currentlyWorking:
      e.currentlyWorking ||
      e.currently_working === 1 ||
      e.currently_working === "1" ||
      e.currently_working === true ||
      e.is_current === true ||
      false,
    responsibilities: e.responsibilities || e.description || "",
    attachment: e.attachment || e.document_url || null,
  }))

  const skills: SkillItem[] = (data.skills || []).map((s: any) => ({
    id: s.id,
    skillName: s.skillName || s.skill_name || s.name || "",
  }))

  return { cv, languages, educations, experiences, skills }
}
