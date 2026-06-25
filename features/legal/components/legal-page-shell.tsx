import Image from "next/image"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { SectionShell } from "@/features/shared-home"

type ActionButton = {
  href: string
  label: string
}

type LegalPageShellProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ActionButton[]
  children: ReactNode
}

export function LegalPageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: LegalPageShellProps) {
  return (
    <main className="flex-1 bg-white">
      <SectionShell stagger={false} className="relative bg-white py-[72px]">
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/contact/noise-bg.png" alt="" fill className="object-cover" />
        </div>

        <div className="relative mx-auto max-w-[980px] space-y-8">
          <p className="inline-flex w-fit items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.2)] px-4 py-2 text-[12px] font-semibold leading-[1.16] text-[#40A0CA]">
            {eyebrow}
          </p>

          <div className="space-y-5">
            <h1 className="font-heading text-[40px] font-bold leading-[1.1] text-[#171717] sm:text-[48px]">
              {title}
            </h1>
            <p className="max-w-[780px] text-[16px] leading-[1.8] text-[#525252]">
              {description}
            </p>
          </div>

          {actions?.length ? (
            <div className="flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[#001222] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : null}

          {children}
        </div>
      </SectionShell>
    </main>
  )
}
