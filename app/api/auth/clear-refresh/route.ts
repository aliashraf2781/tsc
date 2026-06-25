import { clearRefreshCookie } from '@/lib/auth-token'

export async function POST() {
  // Clear the auth cookies (used for debugging / recovery)
  return clearRefreshCookie({ success: true }, 200)
}
