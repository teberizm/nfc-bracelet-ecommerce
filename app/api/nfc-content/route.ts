import { NextResponse, type NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { createNFCContent, updateNFCContent } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, themeId, theme, customizations } = body
    const finalThemeId = themeId || theme || null

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Missing orderId" }, { status: 400 })
    }
    

    const created = await createNFCContent({ order_id: orderId, theme_id: finalThemeId, customizations })
    const normalized = { ...created, themeId: created.theme_id }
    return NextResponse.json({ success: true, nfcContent: normalized })
  } catch (error) {
    console.error("Error in POST /api/nfc-content:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, themeId, theme, customizations } = body
    const finalThemeId = themeId || theme

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Missing orderId" }, { status: 400 })
    }

    const updated = await updateNFCContent(orderId, { theme_id: finalThemeId, customizations })
    const normalized = { ...updated, themeId: updated.theme_id }
    return NextResponse.json({ success: true, nfcContent: normalized })
  } catch (error) {
    console.error("Error in PUT /api/nfc-content:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}