import type { EducationItem, ExperienceItem, LanguageItem, SkillItem } from "../types/portfolio.types"

export function buildPortfolioFormData({
  cvFile,
  cvRemoved,
  languages,
  educations,
  experiences,
  skills,
}: {
  cvFile: File | null
  cvRemoved: boolean
  languages: LanguageItem[]
  educations: EducationItem[]
  experiences: ExperienceItem[]
  skills: SkillItem[]
}): FormData {
  const formData = new FormData()

  if (cvFile) {
    formData.append("cv", cvFile)
  } else if (cvRemoved) {
    formData.append("remove_cv", "true")
  }

  languages.forEach((lang, idx) => {
    formData.append(`languages[${idx}][language]`, lang.language)
    formData.append(`languages[${idx}][level]`, lang.level)
    if (lang.id) formData.append(`languages[${idx}][id]`, String(lang.id))
  })

  educations.forEach((edu, idx) => {
    formData.append(`education[${idx}][university]`, edu.university)
    formData.append(`education[${idx}][level_of_education]`, edu.levelOfEducation)
    formData.append(`education[${idx}][graduation_year]`, edu.graduationYear)
    formData.append(`education[${idx}][specialization]`, edu.specialization)
    formData.append(`education[${idx}][final_grade]`, edu.finalGrade)
    if (edu.id) formData.append(`education[${idx}][id]`, String(edu.id))
    if (edu.attachmentFile) formData.append(`education[${idx}][attachment]`, edu.attachmentFile)
  })

  experiences.forEach((exp, idx) => {
    formData.append(`work_experience[${idx}][company_name]`, exp.companyName)
    formData.append(`work_experience[${idx}][department]`, exp.department)
    formData.append(`work_experience[${idx}][start_date]`, exp.startDate)
    if (exp.endDate && !exp.currentlyWorking) {
      formData.append(`work_experience[${idx}][end_date]`, exp.endDate)
    }
    formData.append(`work_experience[${idx}][currently_working]`, exp.currentlyWorking ? "1" : "0")
    formData.append(`work_experience[${idx}][responsibilities]`, exp.responsibilities || "")
    // Do not send ID due to non-existent 'user_work_experiences' table validation bug on Laravel backend
    if (exp.attachmentFile) formData.append(`work_experience[${idx}][attachment]`, exp.attachmentFile)
  })

  skills.forEach((skill, idx) => {
    formData.append(`skills[${idx}][skill_name]`, skill.skillName)
    if (skill.id) formData.append(`skills[${idx}][id]`, String(skill.id))
  })

  return formData
}
