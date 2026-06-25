"use client"

import type { ReactNode, MouseEvent } from "react"
import Image from "next/image"
import { useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type Props = {
  backLabel: string
  backHref: string
  logoAlt: string
  title: string
  description: string
  children: ReactNode
  footerPrefix: string
  footerActionLabel: string
  footerActionHref: string
  topSlot?: ReactNode
  asideSlot?: ReactNode
}

export function AuthCardWrapper({
  backLabel,
  backHref,
  logoAlt,
  title,
  description,
  children,
  footerPrefix,
  footerActionLabel,
  footerActionHref,
  topSlot,
  asideSlot,
}: Props) {
  const router = useRouter()
  const locale = useLocale()
  const isRTL = locale === "ar"

  const handleBackClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer || ""
      let prevPath = ""
      try {
        prevPath = sessionStorage.getItem("prevPath") || ""
      } catch {}

      const isUnsafe = (path: string) => {
        const lower = path.toLowerCase()
        return (
          lower.includes("/dashboard") ||
          lower.includes("/admin") ||
          lower.includes("/sign-in") ||
          lower.includes("/sign-up") ||
          lower.includes("/forgot-password") ||
          lower.includes("/verify-email") ||
          lower.includes("/reset-password")
        )
      }

      // Avoid redirect loops if the user came from a private dashboard or admin page (e.g. after logging out)
      // or if there is no previous SPA history track.
      if (isUnsafe(referrer) || isUnsafe(prevPath) || !prevPath) {
        return
      }

      if (window.history.length > 1) {
        e.preventDefault()
        router.back()
      }
    }
  }

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-16 text-white sm:px-6 sm:py-20">
      <Link
        locale={locale}
        href={backHref}
        onClick={handleBackClick}
        className="absolute start-4 top-4 z-10 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#041d33]/80 px-4 py-2.5 text-sm font-medium text-[#b5cadd] transition-colors hover:border-white/20 hover:text-white sm:start-6 sm:top-6 sm:px-6 sm:py-3 sm:text-lg"
      >
        <Image
          src="/auth/arrows.png"
          alt=""
          width={16}
          height={16}
          className={cn("h-auto w-4 shrink-0 opacity-100", isRTL && "scale-x-[-1]")}
          aria-hidden
        />
        <span>{backLabel}</span>
      </Link>

      <div className="flex w-full max-w-[470px] md:max-w-[680px] flex-col items-center gap-6 sm:gap-8 transition-all">
        <header className="flex w-full flex-col items-center gap-6 sm:gap-8">
          <Image
            src="/auth/logo.svg"
            alt={logoAlt}
            width={122}
            height={131}
            priority
            className="h-auto w-[96px] sm:w-[122px]"
          />

          <div className="flex w-full flex-col items-center gap-4 sm:gap-6">
            <div className="flex w-full flex-col items-center gap-3 text-center sm:gap-4">
              <h1 className="font-heading text-xl font-bold leading-8 text-white sm:text-2xl sm:leading-9">
                {title}
              </h1>
              <p className="max-w-[412px] text-sm leading-6 text-[#f5f5f5] sm:text-base">{description}</p>
            </div>
            {topSlot}
          </div>
        </header>

        <div className="flex w-full flex-col gap-5 opacity-100">{children}</div>

        {asideSlot}

        <footer className="flex w-full flex-col items-center gap-3 opacity-100 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center gap-1 text-sm leading-[21px]">
            <span className="text-white/70">{footerPrefix}</span>
            <Link locale={locale} href={footerActionHref} className="font-medium text-[#40A0CA] hover:text-[#9fc9e6] transition-colors">
              {footerActionLabel}
            </Link>
          </div>
        </footer>
      </div>
    </section>
  )
}
