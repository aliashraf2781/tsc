import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, callBackend } from "@/lib/auth-token"

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('/api/auth/profile GET called', { hasToken: !!token, tokenPreview: token ? `${String(token).slice(0,8)}...` : null, cookieHeader: request.headers.get('cookie') })
    } catch (e) {
      console.warn('Failed to log profile GET headers', e)
    }
  }
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
  const { data, error, status } = await callBackend<any>('/auth/profile', {
    method: 'GET',
    headers: { 'Accept-Language': locale }
  }, token)

  if (error) {
    return NextResponse.json({ message: error }, { status })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
  // Accept both multipart/form-data (file uploads) and JSON payloads.
  const contentType = (request.headers.get('content-type') || '').toLowerCase()
  if (process.env.NODE_ENV !== 'production') {
    console.log('/api/auth/profile POST called', { contentType, hasToken: !!token })
    try {
      console.log('profile POST headers:', Object.fromEntries(request.headers.entries()))
    } catch (e) {
      console.warn('profile POST: failed to enumerate headers', e)
    }
  }

  let upstreamBody: any = null
  let isForm = false

  if (contentType.includes('multipart/form-data')) {
    try {
      upstreamBody = await request.formData()
      isForm = true
      const keys: string[] = []
      upstreamBody.forEach((v: any, k: string) => keys.push(k))
      if (process.env.NODE_ENV !== 'production') console.log('profile POST parsed formData keys:', keys)
    } catch (err) {
      console.error('profile POST: formData parse failed', err)
      try {
        const txt = await request.text()
        console.error('profile POST: body text (preview):', txt?.slice?.(0, 2000))
      } catch (e) {
        console.error('profile POST: could not read body text', e)
      }
      return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
    }
  } else {
    // Try JSON first, fall back to formData if JSON parse fails
    try {
      const json = await request.json()
      upstreamBody = JSON.stringify(json)
      isForm = false
      if (process.env.NODE_ENV !== 'production') console.log('profile POST parsed JSON keys:', Object.keys(json || {}))
    } catch (errJson) {
      console.warn('profile POST: json parse failed, trying formData', errJson)
      try {
        upstreamBody = await request.formData()
        isForm = true
        const keys: string[] = []
        upstreamBody.forEach((v: any, k: string) => keys.push(k))
        if (process.env.NODE_ENV !== 'production') console.log('profile POST fallback parsed formData keys:', keys)
      } catch (errForm) {
        console.error('profile POST: formData fallback failed', errForm)
        try {
          const txt = await request.text()
          console.error('profile POST: body text (preview):', txt?.slice?.(0, 2000))
        } catch (e) {
          console.error('profile POST: failed to read body text', e)
        }
        return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') console.log('profile POST: sending upstream', { isForm, contentType })

  const { data, error, status } = await callBackend<any>('/auth/profile', {
    method: 'POST',
    headers: { 'Accept-Language': locale },
    // If upstreamBody is a string it's already JSON; otherwise it's FormData
    body: upstreamBody
  }, token)

  if (error) {
    console.error('profile POST upstream error', { status, error })
    return NextResponse.json({ message: error }, { status })
  }

  return NextResponse.json(data)
}
