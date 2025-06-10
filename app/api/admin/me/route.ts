import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { getAdminById } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin me API çağrısı başladı")

    // Admin token'ını doğrula
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    console.log("Admin ID:", adminPayload.adminId)

    // Admin bilgilerini çek
    const admin = await getAdminById(adminPayload.adminId)

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin bulunamadı" }, { status: 404 })
    }

    // Hassas bilgileri çıkar
    const { password_hash, ...adminData } = admin

    console.log("Admin bilgileri çekildi:", adminData.email)

    return NextResponse.json({
      success: true,
      admin: adminData,
    })
  } catch (error) {
    console.error("Admin me hatası:", error)
    return NextResponse.json(
      { success: false, message: "Admin bilgileri çekilirken hata oluştu", error: error.message },
      { status: 500 },
    )
  }
}
