export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { getAllNFCContentForAdmin } from "@/lib/database"

export async function GET(request: Request) {
  try {
    // Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const themeParam = searchParams.get("theme") || undefined
    const theme = themeParam && themeParam !== "all" ? themeParam : undefined

    const nfcContent = await getAllNFCContentForAdmin({ search, theme })

    return NextResponse.json({ success: true, nfcContent })
  } catch (error: any) {
    console.error("Admin nfc-content hatası:", error)
    return NextResponse.json(
      { success: false, message: "NFC içerikleri alınırken hata oluştu", error: error.message },
      { status: 500 },
    )
  }
}