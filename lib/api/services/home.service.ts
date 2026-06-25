// lib/api/services/home.service.ts
import { api } from "../client"
import type { HomeData } from "../types"

function unwrapHomeData(response: unknown): HomeData {
  if (!response || typeof response !== "object") {
    throw new Error("Home payload is not an object")
  }

  const payload = response as { data?: unknown }
  const data = payload.data ?? response

  if (!data || typeof data !== "object") {
    throw new Error("Home payload is missing data")
  }

  return data as HomeData
}

export async function getHomeData(locale = "ar"): Promise<HomeData> {
  const endpoints = ["/home", "/public/home"]

  let lastError: unknown

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<unknown>(endpoint, {
        locale,
        cache: "force-cache",
      })
      return unwrapHomeData(response)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to load home data")
}
