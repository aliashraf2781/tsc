"use client"

import { useMemo } from "react"
import { getProcessSteps } from "@/features/process/services/process.service"

export function useProcessSteps() {
  return useMemo(() => {
    return getProcessSteps()
  }, [])
}
