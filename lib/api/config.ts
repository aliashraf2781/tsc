/** Single source of truth for the backend API base URL. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"
).replace(/\/$/, "")
