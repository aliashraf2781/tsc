import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest } from "@/lib/auth-token"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const { path } = await params
  const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
  
  // Reconstruct backend URL
  const query = request.nextUrl.search
  const targetUrl = `${BACKEND_URL}/${path.join('/')}${query}`

  // Prepare headers
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Accept-Language': locale,
    'Accept': 'application/json',
  }

  const contentType = request.headers.get('content-type')
  if (contentType && !contentType.includes('multipart/form-data')) {
    headers['Content-Type'] = contentType
  }

  // Get body
  let body: any = undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (contentType?.includes('multipart/form-data')) {
      body = await request.formData()
    } else {
      body = await request.text()
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    })

    if (res.status === 401) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 })
    }

    const contentTypeRes = res.headers.get('content-type')
    if (contentTypeRes && contentTypeRes.includes('application/json')) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    } else {
      const data = await res.text()
      return new NextResponse(data, {
        status: res.status,
        headers: { 'Content-Type': contentTypeRes || 'text/plain' }
      })
    }
  } catch (err) {
    return NextResponse.json({ 
      message: err instanceof Error ? err.message : "Proxy request failed" 
    }, { status: 502 })
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context)
}
