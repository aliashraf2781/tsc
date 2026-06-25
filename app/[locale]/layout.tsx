import type { Metadata } from "next"
// Force dynamic rendering for this layout because it reads request headers
export const dynamic = "force-dynamic"
import { Cairo, Encode_Sans, Geist_Mono } from "next/font/google"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { DirectionProvider } from "@/components/ui/direction"
import { routing } from "@/i18n/routing"
import { SiteChrome } from "@/features/shared-home"
import { SiteFooter } from "@/features/shared-home/components/site-footer"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { Toaster } from "@/components/ui/sonner"
import "../globals.css"

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
})

const encodeSans = Encode_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

type MetadataProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "HomePage" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  // ✅ جلب الجلسة
  const session = await getSession().catch(() => null)

  // Normalize the session into a plain object and use it as the single
  // source of truth during SSR. Do NOT call `getProfile` here.
  // Only consider the user logged in when we have a resolved `user` object
  // from the upstream profile call. This prevents transient `isLoggedIn: true`
  // with a null `user` which causes header/sidebar hydration mismatches.
  const sessionData = {
    isLoggedIn: Boolean(session?.user),
    user: session?.user
      ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: normalizeRole(session.user),
        avatar: session.user.avatar,
        company: (session.user as any).company || undefined,
        company_profile: (session.user as any).company_profile || undefined,
        companyProfile: (session.user as any).companyProfile || undefined,
      }
      : null,
  }

  // Single source: use sessionData directly (no upstream profile fetch here).
  const canonicalSessionData = sessionData

  // Production flow only: canonicalSessionData computed above is used
  // directly without developer impersonation or embedded DIAG outputs.

  const direction = locale === "ar" ? "rtl" : "ltr"
  const fontVariable = locale === "ar" ? cairo.variable : encodeSans.variable

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={`${fontVariable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider dir={direction} direction={direction}>
            <SiteChrome session={canonicalSessionData} footer={<SiteFooter />}>
              {children}
            </SiteChrome>
            <Toaster
              position="top-center"
              richColors
              offset={88}
              duration={2500}
              style={{ "--width": "clamp(340px, 90vw, 560px)" } as React.CSSProperties}
            />
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}