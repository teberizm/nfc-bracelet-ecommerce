import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("🚀 Admin orders API başladı")

    // Önce basit bir test sorgusu yapalım
    const testResult = await sql`SELECT 1 as test`
    console.log("✅ Database bağlantısı çalışıyor:", testResult)

    // URL parametrelerini al
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "10") // Küçük limit
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("📊 Parametreler:", { search, status, sortBy, sortOrder, limit, offset })

    // Önce sadece orders tablosunu kontrol edelim
    const ordersCount = await sql`SELECT COUNT(*) as count FROM orders`
    console.log("📦 Toplam sipariş sayısı:", ordersCount[0]?.count)

    // Users tablosunu kontrol edelim
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`
    console.log("👥 Toplam kullanıcı sayısı:", usersCount[0]?.count)

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
        o.payment_method
      FROM orders o
    `

    const conditions = []
    const params = []

    // Status filtresi ekle
    if (status && status !== "" && status !== "all") {
      conditions.push(`o.status = $${params.length + 1}`)
      params.push(status)
    }

    // Search filtresi ekle
    if (search && search !== "") {
      conditions.push(`o.order_number ILIKE $${params.length + 1}`)
      params.push(`%${search}%`)
    }

    // WHERE koşulları
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(" AND ")}`
    }

    // Sıralama - güvenli sıralama
    const allowedSortFields = ["created_at", "order_number", "total_amount", "status"]
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at"
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC"

    baseQuery += ` ORDER BY o.${safeSortBy} ${safeSortOrder}`

    // Limit ve offset
    baseQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    console.log("🔍 SQL Query:", baseQuery)
    console.log("🔍 Parameters:", params)

    // Sorguyu çalıştır
    const orders = await sql.unsafe(baseQuery, ...params)
    console.log("✅ Orders çekildi:", orders.length)

    // Her sipariş için kullanıcı bilgilerini ayrı çek
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        try {
          const user = await sql`
            SELECT first_name, last_name, email, phone 
            FROM users 
            WHERE id = ${order.user_id}
            LIMIT 1
          `

          const orderItems = await sql`
            SELECT id, product_name, quantity, unit_price, total_price
            FROM order_items 
            WHERE order_id = ${order.id}
            LIMIT 5
          `

          return {
            ...order,
            user_email: user[0]?.email || "Bilinmiyor",
            first_name: user[0]?.first_name || "Bilinmiyor",
            last_name: user[0]?.last_name || "Bilinmiyor",
            user_phone: user[0]?.phone || "",
            items: orderItems || [],
          }
        } catch (error) {
          console.error(`❌ Order ${order.id} için user bilgisi alınamadı:`, error)
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

    console.log("✅ Tüm veriler hazır:", ordersWithUsers.length)

    return NextResponse.json({
      success: true,
      orders: ordersWithUsers,
      total: ordersWithUsers.length,
      debug: {
        totalOrders: ordersCount[0]?.count,
        totalUsers: usersCount[0]?.count,
        query: baseQuery,
        params: params,
      },
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
