"use client"

import Image from "next/image"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

type AuthTelInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  iconSrc?: string
}

/** Phone field: digits LTR, aligned to the end in Arabic UI */
export function AuthTelInput({ className, iconSrc = "/auth/email.svg", ...props }: AuthTelInputProps) {
  const locale = useLocale()
  const isRTL = locale === "ar"

  return (
    <label className="auth-field block">
      <div className="auth-input-wrap">
        <Image src={iconSrc} alt="" width={20} height={20} className="shrink-0 opacity-100" aria-hidden />
        <input
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          className={cn(
            "auth-input min-w-0 text-base leading-6 placeholder:text-white/80 unicode-plaintext",
            isRTL ? "text-end" : "text-start",
            className
          )}
          {...props}
        />
      </div>
    </label>
  )
}
