import { NextResponse } from "next/server"
import { getAllUsersForAdmin } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Token'ı al ve doğrula
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // URL parametrelerini al
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Kullanıcıları al
    const users = await getAllUsersForAdmin({
      limit,
      offset,
      search: search || undefined,
      sortBy,
      sortOrder,
    })

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Error in /api/admin/users:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
