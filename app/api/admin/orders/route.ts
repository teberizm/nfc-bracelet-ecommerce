import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("🚀 Admin orders API başladı")

    // URL parametrelerini al
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("📊 Parametreler:", { search, status, sortBy, sortOrder, limit, offset })

    // Basit orders sorgusu
    let baseQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.subtotal,
        o.total_amount,
        o.status,
        o.created_at,
        o.payment_method,
        u.first_name,
        u.last_name,
        u.email as user_email,
        u.phone as user_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `

    const conditions = []
    const params = []

    // Status filtresi
    if (status && status !== "" && status !== "all") {
      conditions.push(`o.status = $${params.length + 1}`)
      params.push(status)
    }

    // Search filtresi
    if (search && search !== "") {
      conditions.push(
        `(o.order_number ILIKE $${params.length + 1} OR u.first_name ILIKE $${params.length + 1} OR u.last_name ILIKE $${params.length + 1})`,
      )
      params.push(`%${search}%`)
    }

    // WHERE koşulları
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(" AND ")}`
    }

    // Güvenli sıralama
    const allowedSortFields = ["created_at", "order_number", "total_amount", "status"]
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at"
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC"

    baseQuery += ` ORDER BY o.${safeSortBy} ${safeSortOrder}`
    baseQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    console.log("🔍 SQL Query:", baseQuery)

    // Sorguyu çalıştır
    const orders = await sql.unsafe(baseQuery, ...params)
    console.log("✅ Orders çekildi:", orders.length)

    // Her sipariş için items çek
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT id, product_name, quantity, unit_price, total_price, nfc_enabled
          FROM order_items 
          WHERE order_id = ${order.id}
        `

        return {
          ...order,
          items: items || [],
        }
      }),
    )

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
      total: ordersWithItems.length,
    })
  } catch (error) {
    console.error("❌ Admin orders hatası:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Siparişler yüklenirken hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}
