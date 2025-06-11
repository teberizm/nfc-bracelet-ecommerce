import { NextResponse } from "next/server"
import { getAllOrdersForAdmin } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin orders API çağrısı başladı")

    // URL parametrelerini al
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Siparişler çekiliyor:", { search, status, sortBy, sortOrder, limit, offset })

    // Status filtresini düzelt - "all" ise boş string yap
    const statusFilter = status === "all" ? "" : status

    // Siparişleri çek
    const orders = await getAllOrdersForAdmin({
      search,
      status: statusFilter,
      sortBy,
      sortOrder,
      limit,
      offset,
    })

    console.log(`${orders.length} sipariş çekildi`)

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    })
  } catch (error) {
    console.error("Admin orders hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Siparişler çekilirken hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}
