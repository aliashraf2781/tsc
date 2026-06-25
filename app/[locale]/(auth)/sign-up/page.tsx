import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  AuthCardWrapper,
} from "@/features/auth/components/auth-card-wrapper"
import { SignUpTabForm } from "@/features/auth/components/sign-up-tab-form"
import { getCountries } from "@/lib/api/services/auth.service"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Auth.signUp")

  // Pre-fetch countries list on the server side
  const countries = await getCountries(locale).catch(() => [])

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
      <SignUpTabForm
        userTabLabel={t("userTab")}
        companyTabLabel={t("companyTab")}
        tabListLabel={t("accountTypeTabs")}
        fullNamePlaceholder={t("fields.fullNamePlaceholder")}
        emailPlaceholder={t("fields.emailPlaceholder")}
        passwordPlaceholder={t("fields.passwordPlaceholder")}
        showPasswordLabel={t("fields.showPassword")}
        hidePasswordLabel={t("fields.hidePassword")}
        phonePlaceholder={t("fields.phonePlaceholder")}
        confirmPasswordPlaceholder={t("fields.confirmPasswordPlaceholder")}
        companyNamePlaceholder={t("fields.companyNamePlaceholder")}
        submitLabel={t("submit")}
        initialCountries={countries as any}
      />
    </AuthCardWrapper>
  )
}

export const dynamic = "force-dynamic"
