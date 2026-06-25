"use client"

import * as React from "react"
import type { User } from "@/lib/api/types"
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"
import { normalizeRole } from "@/lib/auth-token"
import { useDashboardMobileMenu } from "@/features/shared-home/components/dashboard-mobile-menu-context"

export type DashboardShellProps = {
  locale: string
  user: User
  children: React.ReactNode
  isMobileMenuOpen?: boolean
  onOpenMobileMenu?: () => void
  onCloseMobileMenu?: () => void
}

export function DashboardShell({ locale, user, children, isMobileMenuOpen, onOpenMobileMenu, onCloseMobileMenu }: DashboardShellProps) {
  const mobileMenu = useDashboardMobileMenu()
  const isOpen = isMobileMenuOpen ?? mobileMenu.isOpen

  React.useEffect(() => {
    document.body.style.backgroundColor = "#F7F9FC"
    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [])

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        onOpenMobileMenu?.()
        mobileMenu.open()
        return
      }
      onCloseMobileMenu?.()
      mobileMenu.close()
    },
    [mobileMenu, onCloseMobileMenu, onOpenMobileMenu]
  )

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-[1512px] px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 lg:px-4 lg:pt-6">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
            <div className="lg:sticky lg:top-[134px] lg:self-start lg:shrink-0 lg:flex lg:flex-col">
            <DashboardSidebar
              locale={locale}
              userRole={normalizeRole(user) || "user"}
              initialUser={user}
              open={isOpen}
              onOpenChange={handleOpenChange}
            />
          </div>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
