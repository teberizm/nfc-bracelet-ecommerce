import { NextResponse } from "next/request"
import { verifyAdminToken } from "@/lib/auth"
import { getAllOrdersForAdmin } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin orders API çağrısı başladı")

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

    // URL parametrelerini al
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Siparişler çekiliyor:", { search, status, sortBy, sortOrder, limit, offset })

    // Siparişleri çek
    const orders = await getAllOrdersForAdmin({
      search,
      status,
      sortBy,
      sortOrder,
      limit,
      offset,
    })

    console.log(`${orders.length} sipariş çekildi`)

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Admin orders hatası:", error)
    return NextResponse.json(
      { success: false, message: "Siparişler çekilirken hata oluştu", error: error.message },
      { status: 500 },
    )
  }
}
