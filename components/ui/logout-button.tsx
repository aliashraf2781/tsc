"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

type LogoutButtonProps = {
  label?: string
  className?: string
  disabled?: boolean
  onDone?: () => void
  isRTL?: boolean
}

export function LogoutButton({ label = "Logout", className, disabled = false, onDone, isRTL }: LogoutButtonProps) {
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleClick = React.useCallback(async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch {
      setIsLoggingOut(false)
    }
    try {
      onDone?.()
    } catch {}
  }, [logout, onDone])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoggingOut}
      className={cn(
        className ?? "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-100 cursor-pointer",
        (disabled || isLoggingOut) && "opacity-60 cursor-not-allowed"
      )}
    >
      <LogOut className="h-4 w-4 stroke-[1.5]" />
      <span>{isLoggingOut ? "..." : (isRTL ? "تسجيل الخروج" : label)}</span>
    </button>
  )
}

export default LogoutButton
