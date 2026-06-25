import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server"
import { PrimaryButton } from "@/components/ui/primary-button"

import { SectionShell } from "@/features/shared-home"

type SupportSectionProps = {
  override?: {
    title?: string
    description?: string
  }
}

export async function SupportSection({ override }: SupportSectionProps) {
  const locale = await getLocale()
  setRequestLocale(locale)
  const t = await getTranslations("Landing.support")
  const title = override?.title ?? t("title")
  const description = override?.description ?? t("description")

  return (
    <SectionShell stagger={false} className="overflow-x-clip bg-white py-12 sm:py-14 lg:py-[72px]">
      <div className="relative isolate overflow-hidden rounded-[32px] bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#398DB3_0%,#2D7494_100%)] bg-[length:200px_200px,auto] bg-blend-[plus-lighter,normal] px-6 py-12 text-white shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#C2E3FA,0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19),0_42px_107px_rgba(123,190,255,0.34)] sm:px-10 sm:py-16 lg:px-14 lg:py-[82px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay [background-image:url('/contact/button-noise.png')] [background-size:420px_420px]"
          aria-hidden
        />

        <div className="relative z-[1] flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-white/95">
            <Image src="/footer/icon-link.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden />
            <span>{t("eyebrow")}</span>
          </div>

          <div className="space-y-4">
            <h2 className="mx-auto max-w-[760px] text-balance font-[family-name:var(--font-encode-sans-narrow)] text-[30px] font-bold leading-[1.1] text-white sm:text-[36px] lg:text-[42px]">
              {title}
            </h2>
            <p className="mx-auto max-w-[640px] text-sm leading-7 text-white/90 sm:text-base">
              {description}
            </p>
          </div>

          <div className="mt-6 flex flex-row items-center justify-center gap-3 w-full max-w-md mx-auto flex-nowrap px-2 sm:gap-4">
            <PrimaryButton asChild className="h-10 w-fit px-3 rounded-lg text-[12px] font-medium sm:h-11 sm:px-5 sm:text-base flex-shrink-0">
              <Link locale={locale} href="/contact" className="inline-flex items-center justify-center gap-2">
                <span>{t("actions.contact")}</span>
                <Image src="/contact.svg" alt="" width={16} height={16} aria-hidden className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
              </Link>
            </PrimaryButton>

            <Link
              locale={locale}
              href="/faqs"
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-white px-3 text-[12px] font-medium shadow-[inset_0_1px_4px_2px_#C2DDFF] transition-transform hover:scale-105 sm:h-11 sm:px-5 sm:text-base flex-shrink-0"
            >
              <span className="bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-clip-text text-transparent">
                {t("actions.faqs")}
              </span>
              <Image src="/faqs.svg" alt="" width={16} height={16} aria-hidden className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
