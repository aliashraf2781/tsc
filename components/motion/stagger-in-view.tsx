"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import {
  staggerContainerVariants,
  staggerItemVariants,
  staggerViewport,
} from "@/components/motion/stagger-variants"

type StaggerInViewProps = {
  children: React.ReactNode
  className?: string
  leadDelay?: number
  staggerDelay?: number
  /** Skip scroll-reveal (content always visible — fixes opacity on mobile) */
  immediate?: boolean
}

type StaggerItemProps = {
  children: React.ReactNode
  className?: string
  immediate?: boolean
}

export function StaggerInView({
  children,
  className,
  leadDelay = 0.35,
  staggerDelay = 0.16,
  immediate = false,
}: StaggerInViewProps) {
  if (immediate) {
    return <div className={cn(className)}>{children}</div>
  }

  const containerVariants = {
    ...staggerContainerVariants,
    visible: {
      ...staggerContainerVariants.visible,
      transition: {
        delayChildren: leadDelay,
        staggerChildren: staggerDelay,
      },
    },
  }

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...staggerViewport, amount: 0.15, margin: "0px 0px -5% 0px" }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, immediate = false }: StaggerItemProps) {
  if (immediate) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <motion.div className={cn(className)} variants={staggerItemVariants}>
      {children}
    </motion.div>
  )
}
