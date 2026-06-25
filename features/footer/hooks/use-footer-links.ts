"use client"

import { useMemo } from "react"
import { getFooterQuickLinkKeys } from "@/features/footer/services/footer-links.service"

export function useFooterLinks() {
  return useMemo(() => getFooterQuickLinkKeys(), [])
}
