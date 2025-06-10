import { NextResponse } from "next/server"
import { getAdminById } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Token'ı al
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Token'ı doğrula
    const decoded = await verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Admin bilgilerini al
    const admin = await getAdminById(decoded.adminId)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 })
    }

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
    console.error("Error in /api/admin/me:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
