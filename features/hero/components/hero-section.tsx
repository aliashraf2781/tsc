import Image from "next/image"
import { getTranslations, getLocale } from "next-intl/server"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { Link } from "@/i18n/navigation"
import { HeroTitle } from "./hero-title"

type HeroSectionProps = {
  title?: string
  description?: string
  image?: string
}

export async function HeroSection({ title: titleOverride, description: descriptionOverride, image }: HeroSectionProps) {
  const t = await getTranslations("Landing.hero")
  const locale = await getLocale()
  const title = titleOverride || t("title")
  const description = descriptionOverride || t("description")
  const heroBackgroundImage = image || "/home/hero/hero-bg-image.png"

  return (
    <SectionShell
      id="home"
      stagger={false}
      className="relative min-h-[720px] overflow-hidden bg-[#001222] pb-16 pt-4 sm:min-h-[880px] lg:h-auto lg:min-h-0 lg:pb-0 lg:pt-0 lg:py-24"
    >
      {/* Background Bars */}
      <div
        className="absolute inset-x-0 bottom-0 top-1/4 z-0 opacity-80"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(64, 160, 202, 0.15) 60px, rgba(64, 160, 202, 0.15) 120px)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div className="absolute inset-0 z-0">
        <Image src={heroBackgroundImage} alt="" fill className="object-cover opacity-[0.08] mix-blend-overlay" aria-hidden />
        <Image src="/home/hero/hero-blur.svg" alt="" fill className="object-cover opacity-90" aria-hidden />
      </div>

      {/* Bottom Glow / Spotlight Arc */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160%] h-[480px] sm:h-[560px] lg:hidden rounded-[100%] bg-gradient-to-t from-[#40a0ca]/70 via-[#006ea8]/30 to-transparent blur-[60px] sm:blur-[90px] pointer-events-none z-[1]"
        style={{
          transform: "translateX(-50%) translateY(50%)",
        }}
      />
      
      <Image
        src="/home/hero/hero-glow-left.svg"
        alt=""
        width={501}
        height={501}
        className="pointer-events-none absolute -top-8 -left-[112px] z-3 opacity-30"
        aria-hidden
      />
      <Image
        src="/home/hero/hero-glow-right.svg"
        alt=""
        width={501}
        height={501}
        className="pointer-events-none absolute -top-8 -right-[112px] z-3 opacity-30"
        aria-hidden
      />

      <StaggerInView
        immediate
        className="relative z-10 mt-6 flex flex-col items-center gap-8 px-4 pb-8 sm:mt-10 sm:gap-10 lg:mt-0 lg:gap-[28px] lg:px-0 lg:pb-0"
      >
        <StaggerItem immediate>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-white/95">
            <Image src="/footer/icon-link.svg" alt="" width={16} height={16} aria-hidden />
            <span>{t("eyebrow")}</span>
          </div>
        </StaggerItem>

        <StaggerItem immediate>
          <HeroTitle
            title={title}
            className="font-heading mx-auto mt-2 max-w-[866px] text-balance text-center text-[32px] font-bold leading-relaxed text-white sm:mt-4 sm:text-[44px] md:text-[56px] lg:text-[56px] lg:leading-[1.15]"
          />
        </StaggerItem>

        <StaggerItem immediate>
          <p className="mx-auto mt-4 max-w-[680px] text-pretty text-center text-[15px] font-normal leading-relaxed text-white/80 sm:mt-6 sm:text-[16px] lg:mt-4 lg:text-[16px] lg:leading-[1.6]">
            {description}
          </p>
        </StaggerItem>

        <StaggerItem immediate>
          <Link locale={locale} href="/jobs">
            <PrimaryButton className="mt-4 h-[52px] w-[220px] lg:mt-2 lg:h-[48px] lg:w-[200px]">
              {t("cta")}
            </PrimaryButton>
          </Link>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}