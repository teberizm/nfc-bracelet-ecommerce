import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { getAdminById } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin me API çağrısı başladı")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Admin me: Authorization header eksik")
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      console.log("Admin me: Token geçersiz")
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    console.log("Admin me: Token doğrulandı, admin bilgileri çekiliyor...")

    // Admin bilgilerini veritabanından çek
    const admin = await getAdminById(adminPayload.adminId)

    if (!admin) {
      console.log("Admin me: Admin bulunamadı")
      return NextResponse.json({ success: false, message: "Admin bulunamadı" }, { status: 404 })
    }

    console.log("Admin me: Admin bilgileri başarıyla çekildi")

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        created_at: admin.created_at,
        last_login: admin.last_login,
      },
    })
  } catch (error) {
    console.error("Admin me error:", error)
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 })
  }
}
