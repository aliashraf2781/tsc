import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-token"
import { API_BASE_URL } from "@/lib/api/config"

const BASE_URL = API_BASE_URL

async function proxy(request: NextRequest, upstreamPath: string) {
  const session = await getSession().catch(() => null)
  const token = session?.accessToken

  // Forward common headers and cookies
  const headers: Record<string, string> = {}
  const accept = request.headers.get("accept")
  const acceptLang = request.headers.get("accept-language")
  const contentType = request.headers.get("content-type")
  const cookie = request.headers.get("cookie")

  if (accept) headers["Accept"] = accept
  if (acceptLang) headers["Accept-Language"] = acceptLang
  if (contentType) headers["Content-Type"] = contentType
  if (cookie) headers["Cookie"] = cookie
  if (token) headers["Authorization"] = `Bearer ${token}`

  const url = `${BASE_URL}${upstreamPath}`

  const method = request.method
  const body = !["GET", "HEAD"].includes(method) ? await request.arrayBuffer() : undefined

  const res = await fetch(url, {
    method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  })

  const text = await res.text().catch(() => "")
  let parsed: unknown = null
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = text
  }

  const nextRes = NextResponse.json(parsed ?? null, { status: res.status })
  return nextRes
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ companyType: string }> }) {
  const { companyType } = await params
  const query = request.nextUrl.search || ""
  return proxy(request, `/company-types/${encodeURIComponent(companyType)}${query}`)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ companyType: string }> }) {
  const { companyType } = await params
  return proxy(request, `/company-types/${encodeURIComponent(companyType)}`)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ companyType: string }> }) {
  const { companyType } = await params
  return proxy(request, `/company-types/${encodeURIComponent(companyType)}`)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ companyType: string }> }) {
  const { companyType } = await params
  return proxy(request, `/company-types/${encodeURIComponent(companyType)}`)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ companyType: string }> }) {
  const { companyType } = await params
  return proxy(request, `/company-types/${encodeURIComponent(companyType)}`)
}
