"use client"

import { StaggerAuto } from "@/components/motion"

type SectionShellStaggerProps = {
  children: React.ReactNode
  leadDelay?: number
}

export function SectionShellStagger({ children, leadDelay }: SectionShellStaggerProps) {
  return <StaggerAuto leadDelay={leadDelay}>{children}</StaggerAuto>
}
