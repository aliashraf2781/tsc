import type { JobApplication } from "@/lib/api/types"
import { api } from "@/lib/api/client"
import {
  hasValidApplicantName,
  normalizeCompanyApplication,
  type CompanyApplication,
} from "@/features/company-jobs/lib/application-utils"

async function fetchApplicantUser(
  userId: number | string,
  token: string,
  locale: string
): Promise<Record<string, unknown> | null> {
  const endpoints = [`/users/${userId}`, `/admin/users/${userId}`]

  for (const path of endpoints) {
    try {
      const response = await api.get<unknown>(path, { token, locale })
      if (!response || typeof response !== "object") continue
      const root = response as Record<string, unknown>
      const item = (root.data ?? response) as Record<string, unknown> | null
      if (item && typeof item === "object") return item
    } catch {
      // try next endpoint
    }
  }

  return null
}

async function fetchApplicantPortfolio(
  userId: number | string,
  token: string,
  locale: string
): Promise<Record<string, unknown> | null> {
  const endpoints = [`/users/${userId}/portfolio`, `/portfolio/${userId}`]

  for (const path of endpoints) {
    try {
      const response = await api.get<unknown>(path, { token, locale })
      if (!response || typeof response !== "object") continue
      const root = response as Record<string, unknown>
      const item = (root.data ?? response) as Record<string, unknown> | null
      if (item && typeof item === "object") return item
    } catch {
      // try next endpoint
    }
  }

  return null
}

/** Lightweight list enrichment: fetch missing applicant names only (deduped by user id). */
export async function enrichMissingApplicantNames(
  applications: CompanyApplication[],
  token: string,
  locale = "ar"
): Promise<CompanyApplication[]> {
  const missing = applications.filter((application) => !hasValidApplicantName(application))
  if (missing.length === 0) return applications

  const userIds = [
    ...new Set(
      missing
        .map((application) => application.user_id || application.user?.id)
        .filter((id): id is number => typeof id === "number" && id > 0)
    ),
  ]

  const usersById = new Map<number, Record<string, unknown>>()
  await Promise.all(
    userIds.map(async (userId) => {
      const user = await fetchApplicantUser(userId, token, locale)
      if (user) usersById.set(userId, user)
    })
  )

  return applications.map((application) => {
    if (hasValidApplicantName(application)) return application
    const userId = application.user_id || application.user?.id
    if (!userId) return application
    const user = usersById.get(Number(userId))
    if (!user) return application
    return normalizeCompanyApplication({
      ...application,
      user_id: userId,
      user: { ...(application.user || {}), ...user },
    }) as CompanyApplication
  })
}

export async function enrichApplicationRecord(
  application: CompanyApplication,
  token: string,
  locale = "ar"
): Promise<CompanyApplication> {
  const userId = application.user_id || application.user?.id
  if (!userId) return application

  const needsUser =
    !hasValidApplicantName(application) ||
    !application.user?.email ||
    !application.user?.Userprofile?.dateOfBirth
  const portfolioRecord = application.userPortfolio as Record<string, unknown> | undefined
  const needsPortfolio =
    !portfolioRecord ||
    Object.keys(portfolioRecord).length === 0 ||
    !Array.isArray(portfolioRecord.skills)

  if (!needsUser && !needsPortfolio) return application

  const [user, portfolio] = await Promise.all([
    needsUser ? fetchApplicantUser(userId, token, locale) : Promise.resolve(null),
    needsPortfolio ? fetchApplicantPortfolio(userId, token, locale) : Promise.resolve(null),
  ])

  return normalizeCompanyApplication({
    ...application,
    user_id: userId,
    user: user ? { ...(application.user || {}), ...user } : application.user,
    userPortfolio: portfolio || application.userPortfolio,
    portfolio: portfolio || application.portfolio,
    user_portfolio: portfolio || application.userPortfolio,
  }) as CompanyApplication
}

export async function enrichApplicationsList(
  applications: JobApplication[] | CompanyApplication[],
  token: string,
  locale = "ar"
): Promise<CompanyApplication[]> {
  const normalized = applications.map((application) =>
    normalizeCompanyApplication(application) as CompanyApplication
  )
  return enrichMissingApplicantNames(normalized, token, locale)
}
