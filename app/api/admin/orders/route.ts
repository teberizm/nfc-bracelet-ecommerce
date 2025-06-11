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

    // Template literals kullanarak sorgu oluştur
    const query = sql`
      SELECT 
        o.id, 
        o.order_number, 
        o.user_id,
        o.subtotal,
        o.total_amount,
        o.status,
        o.created_at,
        o.payment_method
      FROM orders o
    `

    // Filtreler için koşullar
    const conditions = []
    let whereClause = sql``

    if (status && status !== "all") {
      conditions.push(sql`o.status = ${status}`)
    }

    if (search) {
      conditions.push(sql`o.order_number ILIKE ${"%" + search + "%"}`)
    }

    // WHERE koşullarını ekle
    if (conditions.length > 0) {
      whereClause = sql` WHERE ${sql.join(conditions, sql` AND `)} `
    }

    // Sıralama
    const validSortFields = ["created_at", "order_number", "total_amount", "status"]
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "created_at"
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC"

    // Tam sorguyu oluştur
    const fullQuery = sql`
      ${query}
      ${whereClause}
      ORDER BY o.${sql.identifier(safeSortBy)} ${sql.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset}
    `

    console.log("🔍 SQL Query hazırlandı")

    // Sorguyu çalıştır
    const orders = await fullQuery
    console.log("✅ Orders çekildi:", orders.length)

    // Her sipariş için kullanıcı bilgilerini ve ürünleri çek
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          // Kullanıcı bilgilerini çek
          const users = await sql`
            SELECT first_name, last_name, email, phone 
            FROM users 
            WHERE id = ${order.user_id}
            LIMIT 1
          `
          const user = users[0] || {}

          // Sipariş ürünlerini çek
          const items = await sql`
            SELECT id, product_name, quantity, unit_price, total_price
            FROM order_items 
            WHERE order_id = ${order.id}
          `

          return {
            ...order,
            user_email: user.email || "Bilinmiyor",
            first_name: user.first_name || "Bilinmiyor",
            last_name: user.last_name || "Bilinmiyor",
            user_phone: user.phone || "",
            items: items || [],
          }
        } catch (error) {
          console.error(`❌ Order ${order.id} için detaylar alınamadı:`, error)
          return {
            ...order,
            user_email: "Hata",
            first_name: "Hata",
            last_name: "Hata",
            user_phone: "",
            items: [],
          }
        }
      }),
    )

    console.log("✅ Tüm veriler hazır:", ordersWithDetails.length)

    return NextResponse.json({
      success: true,
      orders: ordersWithDetails,
      total: ordersWithDetails.length,
    })
  } catch (error) {
    console.error("❌ Admin orders hatası:", error)

    // Detaylı hata bilgisi
    const errorInfo = {
      message: error instanceof Error ? error.message : "Bilinmeyen hata",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "UnknownError",
    }

    console.error("❌ Hata detayları:", errorInfo)

    return NextResponse.json(
      {
        success: false,
        message: "Siparişler yüklenirken hata oluştu",
        error: errorInfo.message,
        debug: errorInfo,
      },
      { status: 500 },
    )
  }
}
