import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Token'ı al
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Yetkilendirme başlığı gerekli" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    console.log("Admin token check:", token ? "Present" : "Missing")

    // Demo token kontrolü
    if (token === "demo-token") {
      console.log("Using demo admin token")

      return NextResponse.json({
        success: true,
        admin: {
          id: "demo-admin-id",
          email: "admin@nfcbileklik.com",
          name: "Demo Admin",
          role: "admin",
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
      })
    }

    // Token'ı doğrula
    const payload = await verifyAdminToken(token)

    if (!payload || !payload.adminId) {
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    // Admin bilgilerini getir
    const admins = await sql`
      SELECT id, email, name, role, created_at, last_login
      FROM admins
      WHERE id = ${payload.adminId} AND is_active = true
      LIMIT 1
    `

    if (admins.length === 0) {
      return NextResponse.json({ success: false, message: "Admin bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      admin: admins[0],
    })
  } catch (error) {
    console.error("Admin me error:", error)
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 })
  }
}
