import { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: false, message: "refresh flow removed on backend; unsupported" }, { status: 410 })
}
