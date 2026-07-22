import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession, normalizeRole } from "@/lib/auth-token"
import { getCountriesRaw, normalizeCountryCode } from "@/lib/api/services/countries.service"
import { AdminCountriesPanel } from "@/features/admin/components/admin-countries-panel"
import type { AdminCountry } from "@/features/admin/lib/country-form-schema"

export default async function AdminCountriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const [arList, enList, deList] = await Promise.all([
    getCountriesRaw("ar", session.accessToken),
    getCountriesRaw("en", session.accessToken),
    getCountriesRaw("de", session.accessToken),
  ])

  const idSet = new Set<string>()
  for (const c of arList) if (c?.id != null) idSet.add(String(c.id))
  for (const c of enList) if (c?.id != null) idSet.add(String(c.id))
  for (const c of deList) if (c?.id != null) idSet.add(String(c.id))

  const countries: AdminCountry[] = []
  for (const id of Array.from(idSet)) {
    const arItem = arList.find((x) => String(x.id) === id) || null
    const enItem = enList.find((x) => String(x.id) === id) || null
    const deItem = deList.find((x) => String(x.id) === id) || null
    const base = arItem || enItem || deItem || {}

    const pickName = (item: Record<string, unknown> | null) => {
      if (!item) return ""
      if (typeof item.name === "string") return item.name
      if (item.name && typeof item.name === "object") {
        const map = item.name as Record<string, string>
        return map.ar || map.en || map.de || ""
      }
      return ""
    }

    const rawCode = typeof base.code === "string" ? base.code : String(base.code ?? "")

    countries.push({
      id: Number(base.id),
      name: {
        ar: pickName(arItem),
        en: pickName(enItem),
        de: pickName(deItem),
      },
      code: rawCode ? normalizeCountryCode(rawCode) : "",
    })
  }

  countries.sort((a, b) => a.id - b.id)

  return <AdminCountriesPanel countries={countries} locale={locale} />
}
