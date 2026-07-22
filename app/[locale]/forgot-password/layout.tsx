import type { ReactNode } from "react"
import { AuthShell } from "@/features/auth/components/auth-shell"

type Props = {
  children: ReactNode
}

export default function AuthLayout({ children }: Props) {
  return <AuthShell>{children}</AuthShell>
}
