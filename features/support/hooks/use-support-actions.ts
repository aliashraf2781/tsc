"use client"

import { useMemo } from "react"
import { getSupportActionKeys } from "@/features/support/services/support.service"

export function useSupportActions() {
  return useMemo(() => getSupportActionKeys(), [])
}
