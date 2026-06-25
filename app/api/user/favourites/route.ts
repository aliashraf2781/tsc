import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { getFavoriteJobs, toggleFavorite } from "@/lib/api/services/jobs.service"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"

    const data = await getFavoriteJobs(token, locale)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[Favourites GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load favourites"
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const jobId = Number(body.job_id)
    if (!jobId) {
      return NextResponse.json({ message: "job_id is required" }, { status: 400 })
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"
    const data = await toggleFavorite(jobId, token, locale)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Favourites POST] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to toggle favourite status"
    return NextResponse.json({ message }, { status: 500 })
  }
}

