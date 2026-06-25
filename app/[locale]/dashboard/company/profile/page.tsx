import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getProfile, getCountries, getCities } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"
import { getSession } from "@/lib/auth-token"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import CompanyProfileForm from "@/features/company-profile/components/company-profile-form"

export const dynamic = "force-dynamic"

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  if (!session.user || session.user.role !== "company") redirect(`/${locale}/dashboard`)
  if (!session.accessToken) redirect(`/${locale}/dashboard`)

  let initialProfile: Record<string, unknown> | undefined = undefined

  try {
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const raw = (await getProfile(session.accessToken, locale, { requestId })) as unknown as Record<string, unknown>

    if (raw) {
      // Normalize company profile fields from the API response.
      // The backend may nest data under companyProfile (camelCase) or at the root level.
      const cp = (raw.companyProfile || raw.company_profile || raw.company || {}) as Record<string, unknown>

      const getLocalized = (val: unknown): string => {
        if (typeof val === "string") return val
        if (val && typeof val === "object") {
          const v = val as Record<string, unknown>
          return String(v[locale] ?? v.ar ?? v.en ?? "")
        }
        return ""
      }

      const getCountryId = (): number | undefined => {
        if (raw.country_id) return Number(raw.country_id)
        if (raw.country && typeof raw.country === "object")
          return Number((raw.country as Record<string, unknown>).id)
        if (cp.country && typeof cp.country === "object")
          return Number((cp.country as Record<string, unknown>).id)
        return undefined
      }

      const getCityId = (): number | undefined => {
        if (raw.city && typeof raw.city === "object") return Number((raw.city as Record<string, unknown>).id)
        if (raw.city) return Number(raw.city)
        if (cp.city && typeof cp.city === "object") return Number((cp.city as Record<string, unknown>).id)
        if (cp.city) return Number(cp.city)
        return undefined
      }

      const getCompanyTypeId = (): number | undefined => {
        if (raw.company_type_id) return Number(raw.company_type_id)
        if (raw.company_type && typeof raw.company_type === "object")
          return Number((raw.company_type as Record<string, unknown>).id)
        if (cp.company_type_id) return Number(cp.company_type_id)
        if (cp.companyType && typeof cp.companyType === "object")
          return Number((cp.companyType as Record<string, unknown>).id)
        return undefined
      }

      // Parse phone to separate dial code and raw digits
      const rawPhone = String(raw.phone || cp.phone || raw.mobile || "")

      initialProfile = {
        name: raw.name || getLocalized(raw.company_name) || getLocalized(cp.companyName) || "",
        email: raw.email || raw.email_address || "",
        phone: rawPhone,
        company_name: raw.company_name || cp.companyName || cp.name || raw.name,
        ceo_name: raw.ceo_name || cp.ceoName || cp.ceo_name,
        description: raw.description || cp.description,
        website: raw.website || (cp.website as string) || (cp.website_url as string) || "",
        postal_code: raw.postal_code || (cp.postalCode as string) || (cp.postal_code as string) || "",
        num_of_employees: raw.num_of_employees ?? cp.numOfEmployees ?? cp.num_of_employees,
        company_type: raw.company_type || { id: getCompanyTypeId() },
        company_type_id: getCompanyTypeId(),
        country_id: getCountryId(),
        country: raw.country,
        city: raw.city ?? cp.city,
        city_id: getCityId(),
        avatar:
          (cp.logoUrl as string) ||
          (cp.logo as string) ||
          (raw.avatar as string) ||
          (raw.avatar_url as string) ||
          null,
        cover_image:
          (raw.cover_image as string) ||
          (raw.coverImage as string) ||
          (cp.coverImageUrl as string) ||
          (cp.cover_image as string) ||
          null,
        facebook: (raw.facebook as string) || (cp.socialMedia as any)?.facebook || (cp.facebook as string) || "",
        linkedin: (raw.linkedin as string) || (cp.socialMedia as any)?.linkedin || (cp.linkedin as string) || "",
        twitter_x: (raw.twitter_x as string) || (cp.socialMedia as any)?.twitterX || (cp.twitter_x as string) || "",
        pinterest: (raw.pinterest as string) || (cp.socialMedia as any)?.pinterest || (cp.pinterest as string) || "",
      }
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    } else {
      console.warn(`[Profile] Failed to fetch company profile:`, err)
    }
  }

  // Fetch server-side metadata (countries + initial cities) so the
  // client component receives stable data and avoids hydration flicker
  // when the city select is populated.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serverCountries: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serverCities: any[] = []
  try {
    serverCountries = await getCountries(locale, session.accessToken)
    const countryId = initialProfile?.country_id ?? (initialProfile?.country && typeof initialProfile.country === 'object' ? (initialProfile.country as any).id : undefined)
    if (countryId) {
      serverCities = await getCities(Number(countryId), locale, session.accessToken)
    }
  } catch (e) {
    // Non-fatal: client will fetch metadata as a fallback.
    console.warn('[Profile] Failed to fetch countries/cities server-side', e)
  }

  const isAr = locale === "ar"
  const isDe = locale === "de"
  return (
    <DashboardPageShell
      title={isAr ? "ملف الشركة" : isDe ? "Unternehmensprofil" : "Company Profile"}
      description={isAr ? "تعديل بيانات الشركة" : isDe ? "Unternehmensprofil bearbeiten" : "Edit company profile"}
      isRTL={isAr}
    >
      <CompanyProfileForm
        initialProfile={initialProfile as any}
        serverCountries={serverCountries}
        serverCities={serverCities}
      />
    </DashboardPageShell>
  )
}
