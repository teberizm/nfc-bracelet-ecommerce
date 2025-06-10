import { NextResponse } from "next/server"
import { getAdminById } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Token gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)

    if (!payload || !payload.adminId) {
      return NextResponse.json({ success: false, message: "Geçersiz admin token" }, { status: 401 })
    }

    const admin = await getAdminById(payload.adminId)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Admin me API error:", error)
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 })
  }
}
