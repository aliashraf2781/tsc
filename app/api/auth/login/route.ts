import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies } from "@/lib/auth-token"
import { API_BASE_URL } from "@/lib/api/config"

const BACKEND_URL = API_BASE_URL

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, any> = {}
    try {
      body = await request.json()
    } catch {
      try {
        const form = await request.formData()
        form.forEach((v, k) => { body[k] = v })
      } catch {}
    }

    const email = body.email
    const password = body.password
    const type = body.type || 'user'
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    if (!email || !password) {
      return NextResponse.json({ message: "بيانات الاعتماد غير كاملة" }, { status: 400 })
    }

    // Call Laravel login endpoint
    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    formData.append("type", type)

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Accept-Language': locale,
        'Accept': 'application/json',
      },
      body: formData
    })

    const data = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
      // Detect unverified email – backend returns 403 or a message indicating verification needed
      const isUnverified =
        backendRes.status === 403 ||
        (data?.message && (
          String(data.message).toLowerCase().includes("not verified") ||
          String(data.message).toLowerCase().includes("email_not_verified") ||
          String(data.message).toLowerCase().includes("verify") ||
          String(data.message).toLowerCase().includes("البريد الإلكتروني غير مفعل") ||
          String(data.message).toLowerCase().includes("غير مفعل") ||
          String(data.message).toLowerCase().includes("تأكيد البريد")
        ))
      if (isUnverified) {
        return NextResponse.json(
          { pendingVerification: true, email, message: data?.message || "يرجى تأكيد بريدك الإلكتروني أولاً" },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { message: data?.message || "فشل تسجيل الدخول" }, 
        { status: backendRes.status }
      )
    }

    // Extraction
    const token = 
      data?.data?.accessToken ||
      data?.data?.access_token ||
      data?.data?.token || 
      data?.token || 
      data?.accessToken ||
      data?.tokens?.access_token || 
      data?.data?.tokens?.access_token
    const user = data?.data?.user || data?.user
    
    if (!token || !user) {
      return NextResponse.json({ message: "بيانات الاستجابة من السيرفر غير كاملة" }, { status: 500 })
    }

    // Extract role
    let role = type
    if (user.roles && user.roles.length > 0) {
      const firstRole = user.roles[0]
      role = typeof firstRole === 'object' ? (firstRole.name || firstRole.role) : firstRole
    } else if (user.role) {
      role = user.role
    }
    
    role = String(role).toLowerCase()
    if (role.includes('admin')) role = 'admin'
    else if (role.includes('company') || role.includes('employer')) role = 'company'
    else role = 'user'

    // Fetch full profile to ensure we have all relationships (companyProfile, userprofile, etc.)
    let fullUser = user
    try {
      const profileRes = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': locale,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })
      if (profileRes.ok) {
        const profileData = await profileRes.json().catch(() => null)
        if (profileData?.data || profileData) {
          fullUser = profileData.data || profileData
        }
      }
    } catch (err) {
      console.error("Failed to fetch full profile in login route:", err)
    }

    // Create response and set HttpOnly cookies
    const response = NextResponse.json({ 
      success: true, 
      role, 
      user: fullUser, 
      tokens: { access_token: token } 
    })
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('login route: setting auth cookies', { role, tokenPreview: token ? String(token).slice(0,8) + '...' : null })
      } catch {}
    }
    setAuthCookies(response, token, role, {
      id: Number(fullUser.id),
      name: String(fullUser.name || fullUser.username || ""),
      email: String(fullUser.email || ""),
    })

    return response
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "حدث خطأ غير متوقع" }, 
      { status: 500 }
    )
  }
}
