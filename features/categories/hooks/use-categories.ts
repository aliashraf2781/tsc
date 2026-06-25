"use client"

import { useMemo } from "react"
import { getCategoryKeys } from "@/features/categories/services/categories.service"

export function useCategories() {
  return useMemo(() => getCategoryKeys(), [])
}
