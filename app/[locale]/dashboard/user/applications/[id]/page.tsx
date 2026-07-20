import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { getMyApplicationDetail } from "@/lib/api/services/user.service"
import { getUserPortfolio } from "@/lib/api/services/portfolio.service"
import { getProfile } from "@/lib/api/services/auth.service"
import { ApplicationDetailView, ApplicationNotFound, type AppLocale } from "@/features/applications"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const appLocale = (locale === "ar" || locale === "de" ? locale : "en") as AppLocale

  const session = await getSession()
  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const applicationId = Number(id)
  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    redirect(`/${locale}/dashboard/user/applications`)
  }

  const [application, portfolio, userProfile] = await Promise.all([
    getMyApplicationDetail(session.accessToken, applicationId, appLocale).catch((err) => {
      console.error("[ApplicationDetail] fetch error:", err)
      return null
    }),
    getUserPortfolio(session.accessToken, appLocale).catch(() => undefined),
    getProfile(session.accessToken, appLocale).catch(() => undefined),
  ])

  if (!application) {
    return <ApplicationNotFound locale={appLocale} />
  }

  return (
    <ApplicationDetailView
      application={application}
      portfolio={portfolio}
      userProfile={userProfile}
      locale={appLocale}
    />
  )
}
