"use client"

import { useMemo } from "react"
import { getJobFilterKeys } from "@/features/jobs/services/jobs.service"

export function useJobFilters() {
  return useMemo(() => getJobFilterKeys(), [])
}
