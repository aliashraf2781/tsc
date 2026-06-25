"use client"

import { useMemo } from "react"
import { getNewsKeys } from "@/features/news/services/news.service"

export function useNews() {
  return useMemo(() => getNewsKeys(), [])
}
