"use client"

import * as React from "react"
import Image from "next/image"
import { Link, stripLocalePrefix, usePathname } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

const ACTIVE_GRADIENT_CLASS = "bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)]"

export type SharedSidebarItem = {
  icon: string
  label: string
  href: string
  external?: boolean
}

interface SharedSidebarProps {
  items: SharedSidebarItem[]
  isRTL?: boolean
  onNavigate?: () => void
}

export function SharedSidebar({ items, isRTL = false, onNavigate }: SharedSidebarProps) {
  const locale = useLocale()
  const rawPathname = usePathname()
  const pathname = stripLocalePrefix(rawPathname ?? "/")

  const activeHref = React.useMemo(() => {
    const normalized = pathname.replace(/\/$/, "") || "/"
    const sorted = [...items].filter((i) => !i.external).sort((a, b) => b.href.length - a.href.length)

    for (const item of sorted) {
      const h = item.href.replace(/\/$/, "")
      if (normalized === h || normalized.startsWith(`${h}/`)) return h
    }
    return null
  }, [pathname, items])

  return (
    <nav className="flex flex-col gap-0 py-2" onClick={onNavigate}>
      {items.map((item) => {
        const isExternal = !!item.external
        const active = !isExternal && activeHref === item.href.replace(/\/$/, "")

        const ItemContent = (
          <>
            {active && (
              <span
                className={cn(
                  "absolute top-1/2 z-[2] h-8 w-0.5 -translate-y-1/2",
                  ACTIVE_GRADIENT_CLASS,
                  isRTL ? "right-0" : "left-0"
                )}
                aria-hidden
              />
            )}
            <div
              className={cn(
                "relative z-0 flex h-6 w-6 flex-none items-center justify-center",
                active && "[filter:brightness(0)_saturate(100%)_invert(28%)_sepia(89%)_saturate(1200%)_hue-rotate(176deg)_brightness(92%)_contrast(101%)]"
              )}
            >
              <Image src={item.icon} alt="" width={24} height={24} className={cn("shrink-0", isRTL && "scale-x-[-1]")} aria-hidden />
            </div>
            <span
              className={cn(
                "relative z-[1] flex-none text-base leading-[150%]",
                active
                  ? cn("bg-clip-text font-semibold text-transparent", ACTIVE_GRADIENT_CLASS)
                  : "font-medium text-[#6B7280]"
              )}
            >
              {item.label}
            </span>
          </>
        )

        if (isExternal) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative isolate flex h-14 w-full flex-none items-center gap-2 self-stretch px-4 py-4 text-[#6B7280] transition-colors hover:bg-white/60 hover:text-[#374151]"
            >
              {ItemContent}
            </a>
          )
        }

        return (
          <Link
            key={item.href}
            locale={locale}
            href={item.href}
            className={cn(
              "relative isolate flex h-14 w-full flex-none items-center gap-2 self-stretch px-4 py-4 transition-colors",
              active ? "text-transparent" : "text-[#6B7280] hover:bg-white/60 hover:text-[#374151]"
            )}
          >
            {ItemContent}
          </Link>
        )
      })}
    </nav>
  )
}