/** Single source of truth for the backend API base URL. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://dashboardtalent.talent-sc.de/api/v1"
).replace(/\/$/, "")

/** Backend origin without the `/api/v1` suffix — used for non-REST endpoints like Laravel's broadcasting auth. */
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, "")
