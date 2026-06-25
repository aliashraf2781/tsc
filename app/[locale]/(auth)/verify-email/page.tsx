import { Suspense } from "react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { AuthCardWrapper } from "@/features/auth/components/auth-card-wrapper"
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function VerifyEmailPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Auth.verifyEmail")

  return (
    <AuthCardWrapper
      backHref="/sign-in"
      backLabel={t("back")}
      logoAlt={t("logoAlt")}
      title={t("title")}
      description={t("description")}
      footerPrefix={t("hasAccount")}
      footerActionLabel={t("signIn")}
      footerActionHref="/sign-in"
    >
      <Suspense fallback={
        <div className="flex flex-col gap-5">
          <div className="flex justify-center gap-2 sm:gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-white/20 bg-[#02223b]/80 animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <VerifyEmailForm
          codePlaceholder={t("fields.codePlaceholder")}
          submitLabel={t("submit")}
          resendLabel={t("resend")}
        />
      </Suspense>
    </AuthCardWrapper>
  )
}

export const dynamic = "force-dynamic"

