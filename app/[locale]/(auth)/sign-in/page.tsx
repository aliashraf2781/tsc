"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { useLocale, useTranslations } from "next-intl"
import { AuthCardWrapper } from "@/features/auth/components/auth-card-wrapper"
import { AuthFieldGroup } from "@/features/auth/components/auth-field-group"
import { AuthUserCompanyTabs } from "@/features/auth/components/auth-user-company-tabs"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"

type FormValues = {
  email: string
  password: string
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const t = useTranslations("Auth.signIn")
  const { signIn, isLoading, error: authError } = useAuth()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const isVerified = searchParams.get("verified") === "1"
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  const [error, setError] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<"user" | "company" | "admin">("user")
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      await signIn(values.email, values.password, accountType)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل تسجيل الدخول"
      setError(message)
    }
  }

  return (
    <AuthCardWrapper
      backHref="/"
      backLabel={t("back")}
      logoAlt={t("logoAlt")}
      title={t("title")}
      description={t("description")}
      footerPrefix={t("noAccount")}
      footerActionLabel={t("signUp")}
      footerActionHref="/sign-up"
      topSlot={
        <AuthUserCompanyTabs
          userLabel={t("userTab")}
          companyLabel={t("companyTab")}
          tabListLabel={t("accountTypeTabs")}
          activeTab={accountType}
          onTabChange={setAccountType}
        />
      }
    >
      {/* Email verified success banner */}
      {isVerified && (
        <div className="flex items-center gap-2 rounded-lg border border-green-400/40 bg-green-950/40 px-3 py-2 text-sm text-green-300">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {locale === "ar" ? "تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول." : "Your email has been verified! You can now sign in."}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-[470px] mx-auto flex-col gap-6">
        <AuthFieldGroup>
          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-underline-wrap">
                <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden className="h-5 w-5 shrink-0 opacity-90" />
                <input
                  {...register("email", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  })}
                  id="email"
                  type="email"
                  placeholder={t("fields.emailPlaceholder")}
                  className="auth-input w-full text-base leading-6 text-white placeholder:text-white/60"
                />
              </div>
            </label>
            {errors.email && (
              <span className="text-xs text-red-300">
                {t("fields.emailPlaceholder")} غير صالح
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-underline-wrap">
                <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden className="h-5 w-5 shrink-0 opacity-90" />
                <input
                  {...register("password", { required: true, minLength: 6 })}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("fields.passwordPlaceholder")}
                  className="auth-input w-full text-base leading-6 text-white placeholder:text-white/60"
                />
                <button
                  type="button"
                  className="cursor-pointer shrink-0 p-2 rounded-md hover:bg-white/6 transition focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--ring)]"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? (locale === "ar" ? "إخفاء كلمة المرور" : "Hide password") : (locale === "ar" ? "عرض كلمة المرور" : "Show password")}
                >
                  <Image src={showPassword ? "/auth/eye.svg" : "/auth/eye-off.svg"} alt="" width={20} height={20} aria-hidden />
                </button>
              </div>
            </label>
            {errors.password && (
              <span className="text-xs text-red-300">
                كلمة المرور يجب أن تكون 6 أحرف على الأقل
              </span>
            )}
          </div>
        </AuthFieldGroup>

        <PrimaryButton type="submit" disabled={isLoading} className="font-semibold">
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{t("loading")}</span>
            </>
          ) : (
            t("submit")
          )}
        </PrimaryButton>

        {/* Forgot password – centered below button */}
        <div className="text-center">
          <Link locale={locale} href="/forgot-password" className="text-sm text-white/60 hover:text-white transition-colors">
            {t("forgotPassword")}
          </Link>
        </div>

        {(error || authError) && (
          <div className="text-sm text-red-300 bg-red-950/40 border border-red-400/40 rounded-lg px-3 py-2">
            {error || authError}
          </div>
        )}
      </form>
    </AuthCardWrapper>
  )
}
