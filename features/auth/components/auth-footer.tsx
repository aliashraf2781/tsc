import type { ReactNode } from "react"

type AuthFooterProps = {
  children: ReactNode
}

export function AuthFooter({ children }: AuthFooterProps) {
  return <div className="flex w-[470px] flex-col items-center gap-6">{children}</div>
}
