"use client"

import { Children, isValidElement } from "react"
import { StaggerInView } from "@/components/motion/stagger-in-view"
import { StaggerItem } from "@/components/motion/stagger-in-view"

type StaggerAutoProps = {
  children: React.ReactNode
  className?: string
  leadDelay?: number
}

/** Wraps each direct child in a StaggerItem under one StaggerInView. */
export function StaggerAuto({ children, className, leadDelay }: StaggerAutoProps) {
  const items = Children.toArray(children).filter(Boolean)

  return (
    <StaggerInView className={className} leadDelay={leadDelay}>
      {items.map((child, index) => {
        const key =
          isValidElement(child) && child.key != null ? String(child.key) : `stagger-${index}`

        return <StaggerItem key={key}>{child}</StaggerItem>
      })}
    </StaggerInView>
  )
}
