import { getTranslations, setRequestLocale } from "next-intl/server"
import { AuthCardWrapper } from "@/features/auth/components/auth-card-wrapper"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Auth.forgotPassword")

  return (
    <AuthCardWrapper
      backHref="/sign-in"
      backLabel={t("back")}
      logoAlt={t("logoAlt")}
      title={t("title")}
      description={t("description")}
      footerPrefix={t("rememberPassword")}
      footerActionLabel={t("signIn")}
      footerActionHref="/sign-in"
    >
      <ForgotPasswordForm
        emailPlaceholder={t("fields.emailPlaceholder")}
        codePlaceholder={t("fields.codePlaceholder")}
        passwordPlaceholder={t("fields.passwordPlaceholder")}
        confirmPlaceholder={t("fields.confirmPlaceholder")}
        step1Label={t("step1")}
        step2Label={t("step2")}
        step3Label={t("step3")}
      />
    </AuthCardWrapper>
  )
}

export const dynamic = "force-dynamic"
