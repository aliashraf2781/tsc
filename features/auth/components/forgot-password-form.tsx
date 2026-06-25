"use client"

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { AuthFieldGroup } from "./auth-field-group"
import { useLocale } from "next-intl"

type Step = 1 | 2 | 3

type Props = {
  emailPlaceholder: string
  codePlaceholder: string
  passwordPlaceholder: string
  confirmPlaceholder: string
  step1Label: string
  step2Label: string
  step3Label: string
}

const RESEND_COOLDOWN = 60

export function ForgotPasswordForm({
  emailPlaceholder,
  codePlaceholder,
  passwordPlaceholder,
  confirmPlaceholder,
  step1Label,
  step2Label,
  step3Label,
}: Props) {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmailState] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [cooldown, setCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const locale = useLocale()
  const isRTL = locale === "ar"

  const { forgotPassword, verifyResetCode, resetPassword, loading, error } = useAuth()

  const emailForm = useForm<{ email: string }>()
  const passwordForm = useForm<{ password: string; password_confirmation: string }>()

  const password = passwordForm.watch("password")
  const passwordConfirm = passwordForm.watch("password_confirmation")
  const passwordsMatch = password === passwordConfirm

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step])

  // OTP handlers
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const nd = [...digits]; nd[index] = ""; setDigits(nd)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const nd = [...digits]; nd[index - 1] = ""; setDigits(nd)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!text) return
    const nd = [...digits]
    for (let i = 0; i < 6; i++) nd[i] = text[i] || ""
    setDigits(nd)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
  }

  const code = digits.join("")
  const isCodeComplete = code.length === 6

  // Step 1: Send email
  async function onEmailSubmit(values: { email: string }) {
    try {
      await forgotPassword(values.email)
      setEmailState(values.email)
      startCooldown()
      setStep(2)
    } catch {
      // error set by hook
    }
  }

  // Step 2: Verify OTP code
  async function onCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isCodeComplete) return
    try {
      const token = await verifyResetCode(email, code)
      setResetToken(token)
      setStep(3)
    } catch {
      // error set by hook
    }
  }

  // Resend code
  async function onResend() {
    if (cooldown > 0 || loading) return
    try {
      await forgotPassword(email)
      setResendSuccess(true)
      startCooldown()
      setTimeout(() => setResendSuccess(false), 4000)
    } catch {}
  }

  // Step 3: Reset password
  async function onPasswordSubmit(values: { password: string; password_confirmation: string }) {
    if (values.password !== values.password_confirmation) return
    try {
      await resetPassword(resetToken, values.password, values.password_confirmation)
      setPasswordSuccess(true)
    } catch {
      // error set by hook
    }
  }

  // Step labels
  const stepLabels = [
    isRTL ? "البريد" : "Email",
    isRTL ? "الكود" : "Code",
    isRTL ? "كلمة المرور" : "Password",
  ]

  // Common button style
  const buttonClassName = "h-[52px] w-full rounded-xl bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-[length:120px_120px,auto] bg-blend-[plus-lighter,normal] text-white shadow-[0px_42px_107px_rgba(123,190,255,0.34),0px_24.7206px_32.2574px_rgba(0,86,133,0.19),0px_10.2677px_13.3981px_rgba(0,86,133,0.22),0px_3.7136px_4.8458px_rgba(0,86,133,0.15),inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF] text-base font-semibold hover:brightness-105 transition-all active:translate-y-px disabled:opacity-50 flex items-center justify-center gap-2"

  return (
    <div className="flex w-full max-w-[470px] mx-auto flex-col gap-6">
      {/* Step progress – circle on top, label below */}
      <div className="flex items-start justify-center gap-0" aria-label="Progress steps">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 min-w-[60px] sm:min-w-[72px]">
              <div className={`
                flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                ${step > i + 1
                  ? "bg-green-500 text-white"
                  : step === i + 1
                    ? "bg-[#40A0CA] text-white shadow-[0_0_12px_rgba(64,160,202,0.5)]"
                    : "border border-white/20 bg-white/5 text-white/40"
                }
              `}>
                {step > i + 1 ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium text-center whitespace-nowrap ${
                step === i + 1 ? "text-[#40A0CA]" : step > i + 1 ? "text-green-400" : "text-white/30"
              }`}>
                {label}
              </span>
            </div>
            {/* Connector line between steps */}
            {i < stepLabels.length - 1 && (
              <div className={`h-px w-10 sm:w-16 mt-4 -mx-1 transition-all duration-300 ${step > i + 1 ? "bg-green-500" : "bg-white/15"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Email ─────────────────────────── */}
      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-5">
          <AuthFieldGroup>
            <label className="auth-field block">
              <div className="auth-input-underline-wrap">
                <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
                <input
                  {...emailForm.register("email", { required: true, pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i })}
                  type="email"
                  placeholder={emailPlaceholder}
                  className="auth-input w-full"
                  autoComplete="email"
                />
              </div>
            </label>
          </AuthFieldGroup>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className={buttonClassName}>
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                <span>{isRTL ? "جاري الإرسال..." : "Sending..."}</span>
              </>
            ) : step1Label}
          </button>
        </form>
      )}

      {/* ── Step 2: OTP Code ──────────────────────── */}
      {step === 2 && (
        <form onSubmit={onCodeSubmit} className="flex flex-col gap-5">
          {/* Email chip */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white/70">
            <Image src="/auth/email.svg" alt="" width={16} height={16} aria-hidden />
            <span className="truncate">{email}</span>
          </div>

          {/* 6-digit OTP – underline style */}
          <div className="flex justify-center gap-3 sm:gap-4" dir="ltr">
            {digits.map((digit, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <input
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(index, e)}
                  onPaste={handleDigitPaste}
                  onFocus={(e) => e.target.select()}
                  aria-label={`${isRTL ? "الرقم" : "Digit"} ${index + 1}`}
                  className={`
                    w-10 sm:w-12 h-10 sm:h-12 bg-transparent border-0 border-b-2 text-center text-xl font-bold text-white
                    outline-none transition-all duration-200 caret-transparent
                    ${digit
                      ? "border-[#006ea8]"
                      : "border-white/30 hover:border-white/50"
                    }
                    focus:border-[#006ea8]
                  `}
                />
              </div>
            ))}
          </div>

          {/* Resend success */}
          {resendSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-950/40 px-3 py-2 text-sm text-blue-300">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {isRTL ? "تم إرسال كود جديد" : "A new code has been sent"}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !isCodeComplete} className={buttonClassName}>
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                <span>{isRTL ? "جاري التحقق..." : "Verifying..."}</span>
              </>
            ) : step2Label}
          </button>

          {/* Resend */}
          <div className="text-center text-sm text-white/60">
            {isRTL ? "لم تستلم الكود؟" : "Didn't receive the code?"}{" "}
            {cooldown > 0 ? (
              <span className="text-[#9fc9e6]">
                {isRTL ? `أعد الإرسال بعد ${cooldown}ث` : `Resend in ${cooldown}s`}
              </span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                disabled={loading}
                className="font-medium text-[#40A0CA] underline-offset-2 hover:underline disabled:opacity-50 transition-colors"
              >
                {isRTL ? "إعادة الإرسال" : "Resend"}
              </button>
            )}
          </div>

          {/* Back to step 1 */}
          <button
            type="button"
            onClick={() => { setStep(1); setDigits(["", "", "", "", "", ""]); clearInterval(timerRef.current!) }}
            className="text-xs text-white/40 hover:text-white/70 transition-colors text-center"
          >
            {isRTL ? "← تغيير البريد الإلكتروني" : "← Change email"}
          </button>
        </form>
      )}

      {/* ── Step 3: New password ──────────────────── */}
      {step === 3 && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-5">
          <AuthFieldGroup>
            <div className="space-y-1">
              <label className="auth-field block">
                <div className="auth-input-underline-wrap">
                  <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
                  <input
                    {...passwordForm.register("password", { required: true, minLength: 6 })}
                    type={showPassword ? "text" : "password"}
                    placeholder={passwordPlaceholder}
                    className="auth-input w-full"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="shrink-0 cursor-pointer p-2 rounded-md hover:bg-white/6 transition"
                    aria-label={showPassword ? (isRTL ? "إخفاء كلمة المرور" : "Hide password") : (isRTL ? "عرض كلمة المرور" : "Show password")}
                  >
                    <Image src={showPassword ? "/auth/eye.svg" : "/auth/eye-off.svg"} alt="" width={20} height={20} aria-hidden />
                  </button>
                </div>
              </label>
              {passwordForm.formState.errors.password && (
                <span className="text-xs text-red-300">
                  {isRTL ? "يجب أن تكون 6 أحرف على الأقل" : "At least 6 characters required"}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="auth-field block">
                <div className="auth-input-underline-wrap">
                  <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
                  <input
                    {...passwordForm.register("password_confirmation", { required: true })}
                    type={showConfirm ? "text" : "password"}
                    placeholder={confirmPlaceholder}
                    className="auth-input w-full"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="shrink-0 cursor-pointer p-2 rounded-md hover:bg-white/6 transition"
                    aria-label={showConfirm ? (isRTL ? "إخفاء" : "Hide") : (isRTL ? "عرض" : "Show")}
                  >
                    <Image src={showConfirm ? "/auth/eye.svg" : "/auth/eye-off.svg"} alt="" width={20} height={20} aria-hidden />
                  </button>
                </div>
              </label>
              {passwordConfirm && !passwordsMatch && (
                <span className="text-xs text-red-300">
                  {isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
                </span>
              )}
            </div>
          </AuthFieldGroup>

          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-green-400/40 bg-green-950/40 px-3 py-2 text-sm text-green-300">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {isRTL ? "تم تغيير كلمة المرور بنجاح! جاري التحويل..." : "Password reset successful! Redirecting..."}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !passwordsMatch} className={buttonClassName}>
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
              </>
            ) : step3Label}
          </button>
        </form>
      )}
    </div>
  )
}
