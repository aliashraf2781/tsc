import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type AuthFieldGroupProps = {
  children: ReactNode
  className?: string
}

export function AuthFieldGroup({ children, className }: AuthFieldGroupProps) {
  return (
    <div className={cn("flex w-full max-w-[470px] md:max-w-[680px] flex-col gap-6 px-2 sm:px-0 transition-all", className)}>
      {children}
    </div>
  )
}
