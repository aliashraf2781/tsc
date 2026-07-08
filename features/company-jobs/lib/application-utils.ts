import type { JobApplication, PaginationMeta } from "@/lib/api/types"

export type CompanyApplication = JobApplication & {
  userPortfolio?: Record<string, unknown>
}

export function readStatNumber(stats: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = stats[key]
    if (value != null && !Number.isNaN(Number(value))) return Number(value)
  }
  return 0
}

const INVALID_NAME_TOKENS = new Set(["null", "undefined", "nan", "n/a", "na", "-", "—"])

/** Avoid `String(null)` → `"null"` which breaks masked applicant names. */
export function cleanOptString(value: unknown): string {
  if (value == null) return ""
  const text = String(value).trim()
  if (!text) return ""
  if (INVALID_NAME_TOKENS.has(text.toLowerCase())) return ""
  return text
}

export function isValidPersonName(name: string): boolean {
  const clean = cleanOptString(name)
  if (!clean) return false
  return !INVALID_NAME_TOKENS.has(clean.toLowerCase())
}

export function hasValidApplicantName(application: CompanyApplication): boolean {
  return isValidPersonName(resolveApplicantName(application))
}

export function mapApplicationStatus(status: string): "pending" | "approved" | "rejected" {
  const normalized = String(status || "").trim().toLowerCase()
  if (normalized === "accepted" || normalized === "approved") return "approved"
  if (normalized === "rejected") return "rejected"
  return "pending"
}

export function toApiApplicationStatus(status: "accepted" | "rejected" | "approved"): "approved" | "rejected" {
  return status === "rejected" ? "rejected" : "approved"
}

function unwrapPayload<T>(response: unknown): T | undefined {
  if (!response || typeof response !== "object") return undefined
  const payload = response as { data?: T; items?: T; results?: T }
  if (payload.data !== undefined) return payload.data
  if (payload.items !== undefined) return payload.items
  if (payload.results !== undefined) return payload.results
  return undefined
}

export function extractApplications(response: unknown): CompanyApplication[] {
  let items: unknown[] = []

  if (Array.isArray(response)) {
    items = response
  } else if (response && typeof response === "object") {
    const payload = response as Record<string, unknown>
    if (Array.isArray(payload.data)) items = payload.data
    else if (Array.isArray(payload.applications)) items = payload.applications
    else if (Array.isArray(payload.items)) items = payload.items
    else if (Array.isArray(payload.results)) items = payload.results
  }

  return items
    .map((item) => normalizeCompanyApplication(item))
    .filter((app): app is CompanyApplication => app.id > 0)
}

export function extractApplicationsMeta(response: unknown, page: number, dataLength: number): PaginationMeta {
  if (response && typeof response === "object" && "meta" in response) {
    const meta = (response as { meta?: PaginationMeta }).meta
    if (meta) return meta
  }

  return {
    current_page: page,
    last_page: 1,
    per_page: 10,
    total: dataLength,
  }
}

export function maskName(name: string): string {
  const clean = cleanOptString(name)
  if (!clean || !isValidPersonName(clean)) return ""
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]

  const maskedParts = parts.slice(1).map(() => "****")
  return `${parts[0]} ${maskedParts.join(" ")}`
}

export function resolveApplicantName(application: CompanyApplication): string {
  const row = application as unknown as Record<string, unknown>
  const user = (application.user || {}) as unknown as Record<string, unknown>
  const applicant =
    row.applicant && typeof row.applicant === "object"
      ? (row.applicant as Record<string, unknown>)
      : null
  const profile = (user.Userprofile ?? user.userprofile ?? user.user_profile ?? applicant?.Userprofile) as
    | Record<string, unknown>
    | undefined
  const portfolio = (application.userPortfolio || {}) as Record<string, unknown>

  const first = cleanOptString(
    profile?.firstName ??
      profile?.first_name ??
      user.first_name ??
      user.firstName ??
      applicant?.first_name ??
      applicant?.firstName ??
      portfolio.firstName ??
      portfolio.first_name
  )
  const last = cleanOptString(
    profile?.lastName ??
      profile?.last_name ??
      user.last_name ??
      user.lastName ??
      applicant?.last_name ??
      applicant?.lastName ??
      portfolio.lastName ??
      portfolio.last_name
  )

  if (first) return `${first}${last ? ` ${last}` : ""}`.trim()

  const direct = cleanOptString(
    user.name ??
      application.user?.name ??
      row.user_name ??
      row.userName ??
      row.applicant_name ??
      row.candidate_name ??
      applicant?.name
  )
  if (direct) return direct

  return ""
}

export function getApplicantDisplayName(
  application: CompanyApplication,
  options?: { mask?: boolean; unknownLabel?: string }
): string {
  const resolved = resolveApplicantName(application)
  if (!isValidPersonName(resolved)) return options?.unknownLabel ?? ""
  return options?.mask ? maskName(resolved) : resolved
}

/**
 * Single-application endpoints (`/admin/job-applications/:id`, `/company/applications/:id`)
 * return job info as `jobDetails` with camelCase keys (`subCategory`, `applicationDeadline`,
 * `salary: {from, to}`, `age: {from, to}`, `createdAt`) instead of the app's `Job` shape.
 * Idempotent for already-normalized `job` rows since it prefers existing snake_case keys.
 */
export function normalizeApplicationJob(jobRow: Record<string, unknown>): JobApplication["job"] {
  const salary = jobRow.salary as Record<string, unknown> | undefined
  const age = jobRow.age as Record<string, unknown> | undefined
  return {
    ...jobRow,
    sub_category: jobRow.subCategory ?? jobRow.sub_category,
    application_deadline: jobRow.applicationDeadline ?? jobRow.application_deadline,
    salary_from: salary?.from ?? jobRow.salary_from,
    salary_to: salary?.to ?? jobRow.salary_to,
    age_from: age?.from ?? jobRow.age_from,
    age_to: age?.to ?? jobRow.age_to,
    created_at: jobRow.createdAt ?? jobRow.created_at,
    created_at_human: jobRow.createdAtHuman ?? jobRow.created_at_human,
  } as JobApplication["job"]
}

export function normalizeCompanyApplication(item: unknown): CompanyApplication {
  const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>
  const userSource =
    (row.user && typeof row.user === "object" ? row.user : null) ||
    (row.applicant && typeof row.applicant === "object" ? row.applicant : null) ||
    {}
  const user = userSource as Record<string, unknown>

  // Discover portfolio from multiple possible keys
  const portfolio =
    (row.userPortfolio && typeof row.userPortfolio === "object" && row.userPortfolio) ||
    (row.user_portfolio && typeof row.user_portfolio === "object" && row.user_portfolio) ||
    (row.portfolio && typeof row.portfolio === "object" && row.portfolio) ||
    (user.portfolio && typeof user.portfolio === "object" && user.portfolio) ||
    {}

  const portfolioRecord = portfolio as Record<string, unknown>

  const portfolioProfileRaw =
    (portfolioRecord.userProfile && typeof portfolioRecord.userProfile === "object" && portfolioRecord.userProfile) ||
    (portfolioRecord.user_profile && typeof portfolioRecord.user_profile === "object" && portfolioRecord.user_profile) ||
    (portfolioRecord.profile && typeof portfolioRecord.profile === "object" && portfolioRecord.profile) ||
    null

  // Resolve user profile from nested Userprofile OR reconstruct from flat user fields
  const rawProfile =
    (user.Userprofile && typeof user.Userprofile === "object" ? user.Userprofile : null) ||
    (user.userprofile && typeof user.userprofile === "object" ? user.userprofile : null) ||
    (user.user_profile && typeof user.user_profile === "object" ? user.user_profile : null) ||
    (user.profile && typeof user.profile === "object" ? user.profile : null) ||
    portfolioProfileRaw ||
    (row.user_profile && typeof row.user_profile === "object" ? row.user_profile : null) ||
    (row.profile && typeof row.profile === "object" ? row.profile : null)

  const profileRecord = (rawProfile || {}) as Record<string, unknown>

  // Build a normalized Userprofile that merges nested, flat user-level and portfolio fields
  const normalizedProfile: CompanyApplication["user"]["Userprofile"] = {
    gender: cleanOptString(
      profileRecord.gender ?? user.gender ?? row.gender ?? portfolioRecord.gender ?? portfolioRecord.sex
    ) || null,
    dateOfBirth:
      cleanOptString(
        profileRecord.dateOfBirth ??
          profileRecord.date_of_birth ??
          profileRecord.birth_date ??
          user.birth_date ??
          user.date_of_birth ??
          user.dateOfBirth ??
          portfolioRecord.dateOfBirth ??
          portfolioRecord.date_of_birth ??
          portfolioRecord.birth_date
      ) || null,
    maritalStatus:
      cleanOptString(
        profileRecord.maritalStatus ??
          profileRecord.marital_status ??
          user.marital_status ??
          user.maritalStatus ??
          portfolioRecord.maritalStatus ??
          portfolioRecord.marital_status
      ) || null,
    firstName:
      cleanOptString(profileRecord.firstName ?? profileRecord.first_name ?? user.first_name ?? user.firstName) ||
      null,
    lastName:
      cleanOptString(profileRecord.lastName ?? profileRecord.last_name ?? user.last_name ?? user.lastName) ||
      null,
    categoryId: Number(profileRecord.categoryId ?? profileRecord.category_id ?? user.category_id ?? 0) || null,
    subcategoryId: Number(profileRecord.subcategoryId ?? profileRecord.subcategory_id ?? user.sub_category_id ?? user.subcategory_id ?? 0) || null,
    categoryName: cleanOptString(profileRecord.categoryName ?? profileRecord.category_name ?? user.category_name) || null,
    subcategoryName: cleanOptString(profileRecord.subcategoryName ?? profileRecord.subcategory_name ?? user.subcategory_name) || null,
    facebook: cleanOptString(profileRecord.facebook ?? user.facebook ?? portfolioRecord.facebook) || null,
    linkedin: cleanOptString(profileRecord.linkedin ?? user.linkedin ?? portfolioRecord.linkedin) || null,
    twitterX: cleanOptString(profileRecord.twitterX ?? profileRecord.twitter_x ?? user.twitterX ?? portfolioRecord.twitterX) || null,
    pinterest: cleanOptString(profileRecord.pinterest ?? user.pinterest ?? portfolioRecord.pinterest) || null,
  }

  const cvUrl =
    cleanOptString(
      row.cv_url ??
        row.cvUrl ??
        user.cv_url ??
        user.cvUrl ??
        user.resume_url ??
        portfolioRecord.cv ??
        portfolioRecord.cv_url
    ) || undefined

  let resolvedName = cleanOptString(
    user.name ?? row.user_name ?? row.userName ?? row.applicant_name ?? row.candidate_name
  )

  if (
    !resolvedName &&
    (user.first_name ||
      profileRecord.firstName ||
      profileRecord.first_name ||
      portfolioRecord.firstName ||
      portfolioRecord.first_name)
  ) {
    const f = cleanOptString(
      user.first_name ??
        profileRecord.firstName ??
        profileRecord.first_name ??
        portfolioRecord.firstName ??
        portfolioRecord.first_name
    )
    const l = cleanOptString(
      user.last_name ??
        profileRecord.lastName ??
        profileRecord.last_name ??
        portfolioRecord.lastName ??
        portfolioRecord.last_name
    )
    resolvedName = `${f}${l ? ` ${l}` : ""}`.trim()
  }

  if (!resolvedName) {
    resolvedName = cleanOptString(
      portfolioRecord.name ?? portfolioRecord.full_name ?? portfolioRecord.fullName
    )
  }

  const jobSource =
    (row.job && typeof row.job === "object" && row.job) ||
    (row.jobDetails && typeof row.jobDetails === "object" && row.jobDetails) ||
    null

  return {
    id: Number(row.id ?? row.applicationId ?? row.application_id ?? 0),
    user_id: Number(row.user_id ?? row.userId ?? user.id ?? 0) || undefined,
    job: (jobSource ? normalizeApplicationJob(jobSource as Record<string, unknown>) : row.job) as JobApplication["job"],
    user: {
      id: Number(user.id ?? 0),
      name: resolvedName,
      email: cleanOptString(user.email),
      avatar: user.avatar as string | undefined,
      phone: user.phone as string | undefined,
      city: user.city as CompanyApplication["user"]["city"],
      country: user.country as CompanyApplication["user"]["country"],
      Userprofile: normalizedProfile,
    },
    status: String(row.status ?? "pending") as JobApplication["status"],
    applied_at: String(row.applied_at ?? row.appliedAt ?? row.created_at ?? row.createdAt ?? ""),
    cv_url: cvUrl,
    userPortfolio: portfolioRecord,
  }
}

export function normalizePortfolioShape(portfolio: Record<string, unknown>) {
  const rawEducation =
    (Array.isArray(portfolio.education) && portfolio.education) ||
    (Array.isArray(portfolio.educations) && portfolio.educations) ||
    []

  const rawWorkExperience =
    (Array.isArray(portfolio.workExperience) && portfolio.workExperience) ||
    (Array.isArray(portfolio.work_experience) && portfolio.work_experience) ||
    (Array.isArray(portfolio.experiences) && portfolio.experiences) ||
    []

  const rawSkills =
    (Array.isArray(portfolio.skills) && portfolio.skills) ||
    (Array.isArray(portfolio.skill_set) && portfolio.skill_set) ||
    []

  const rawLanguages =
    (Array.isArray(portfolio.languages) && portfolio.languages) ||
    (Array.isArray(portfolio.langs) && portfolio.langs) ||
    []

  const education = rawEducation.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      university: String(item.university ?? item.institution ?? ""),
      level_of_education: String(item.level_of_education ?? item.levelOfEducation ?? item.degree ?? ""),
      graduation_year: String(item.graduation_year ?? item.graduationYear ?? ""),
      specialization: String(item.specialization ?? ""),
      final_grade: String(item.final_grade ?? item.finalGrade ?? item.grade ?? ""),
      // Accept many possible keys for the document/attachment URL that may come from different backends
      attachment: String(
        item.attachment ??
          item.document_url ??
          item.documentUrl ??
          item.document ??
          item.file_url ??
          item.file ??
          ""
      ),
    }
  })

  const workExperience = rawWorkExperience.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      company_name: String(item.company_name ?? item.companyName ?? item.company ?? ""),
      department: String(item.department ?? item.job_title ?? item.jobTitle ?? ""),
      start_date: String(item.start_date ?? item.startDate ?? ""),
      end_date: String(item.end_date ?? item.endDate ?? ""),
      currently_working: item.currently_working !== undefined 
        ? Boolean(item.currently_working) 
        : item.currentlyWorking !== undefined 
          ? Boolean(item.currentlyWorking) 
          : false,
      responsibilities: String(item.responsibilities ?? ""),
      attachment: String(
        item.attachment ??
          item.document_url ??
          item.documentUrl ??
          item.document ??
          item.file_url ??
          item.file ??
          ""
      ),
    }
  })

  const skills = rawSkills.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      skill_name: String(item.skill_name ?? item.skillName ?? item.name ?? ""),
      // optional attachment on skill objects
      attachment: String(item.attachment ?? item.document_url ?? item.documentUrl ?? item.file_url ?? item.file ?? ""),
    }
  })

  const languages = rawLanguages.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      language: String(item.language ?? ""),
      level: String(item.level ?? item.proficiency ?? ""),
    }
  })

  const cv = String(portfolio.cv ?? portfolio.cv_url ?? "") || undefined

  return { education, workExperience, skills, languages, cv }
}

export function unwrapCompanyStats(response: unknown) {
  const stats =
    (unwrapPayload<Record<string, unknown>>(response) as Record<string, unknown> | undefined) ||
    ((response && typeof response === "object" ? response : {}) as Record<string, unknown>)

  return {
    total_jobs: readStatNumber(stats, [
      "total_jobs",
      "totalJobs",
      "jobs_count",
      "jobsCount",
      "published_jobs",
      "publishedJobs",
    ]),
    total_applications: readStatNumber(stats, [
      "total_applications",
      "totalApplications",
      "applications_count",
      "applicationsCount",
      "applicants_count",
      "applicantsCount",
      "total_applicants",
      "totalApplicants",
    ]),
    pending_applications: readStatNumber(stats, [
      "pending_applications",
      "pendingApplications",
      "pending_count",
      "pendingCount",
    ]),
  }
}
