"use client"

import { useMemo } from "react"
import { getTestimonialKeys } from "@/features/testimonials/services/testimonials.service"

export function useTestimonials() {
  return useMemo(() => getTestimonialKeys(), [])
}
