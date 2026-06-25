"use client"

import * as React from "react"

export type DashboardMobileMenuContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  setOpen: (open: boolean) => void
}

const DEFAULT_CONTEXT: DashboardMobileMenuContextValue = {
  isOpen: false,
  open: () => {},
  close: () => {},
  setOpen: () => {},
}

const DashboardMobileMenuContext = React.createContext<DashboardMobileMenuContextValue>(DEFAULT_CONTEXT)

export function DashboardMobileMenuProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const value = React.useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      setOpen: setIsOpen,
    }),
    [isOpen]
  )

  return <DashboardMobileMenuContext.Provider value={value}>{children}</DashboardMobileMenuContext.Provider>
}

export function useDashboardMobileMenu() {
  return React.useContext(DashboardMobileMenuContext)
}
