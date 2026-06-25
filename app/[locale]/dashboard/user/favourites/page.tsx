import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { getFavoriteJobs } from "@/lib/api/services/jobs.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import FavouritesClient from "./client"

export default async function UserFavouritesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const isAr = locale === "ar"
  const isDe = locale === "de"

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const favoriteJobs = await getFavoriteJobs(session.accessToken, locale as "ar" | "en" | "de").catch(
    () => []
  )

  const labels = {
    title: isAr ? "الوظائف المفضلة" : isDe ? "Gespeicherte Jobs" : "Saved Jobs",
    description: isAr
      ? "شاهد جميع الوظائف التي حفظتها للرجوع إليها لاحقاً"
      : isDe
        ? "Alle Jobs anzeigen, die Sie für später gespeichert haben"
        : "View all the jobs you saved for later",
  }

  return (
    <DashboardPageShell title={labels.title} description={labels.description} isRTL={isAr}>
      <FavouritesClient locale={locale} initialJobs={favoriteJobs} />
    </DashboardPageShell>
  )
}
