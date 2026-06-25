import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, clearAuthCookies } from "@/lib/auth-token"
import { API_BASE_URL } from "@/lib/api/config"

const BACKEND_URL = API_BASE_URL

async function handleLogout(request: NextRequest) {
  const token = getTokenFromRequest(request)
  
  if (token) {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
    } catch (e) {
      console.warn('[api/auth/logout] upstream logout failed', e)
    }
  }

  const response = NextResponse.json({ success: true })
  clearAuthCookies(response)
  return response
}

export async function POST(request: NextRequest) {
  return handleLogout(request)
}

export async function GET(request: NextRequest) {
  return handleLogout(request)
}
