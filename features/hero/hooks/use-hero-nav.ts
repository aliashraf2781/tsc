"use client"

import { useMemo } from "react"
import { getHeroNavItems } from "@/features/hero/services/hero-links.service"

export function useHeroNav() {
  return useMemo(() => getHeroNavItems(), [])
}
