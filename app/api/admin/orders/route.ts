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

    // Basit sorgu ile başla
    let orders = []

    if (status && status !== "all" && status !== "") {
      // Status filtresi var
      orders = await sql`
        SELECT 
          id, order_number, user_id, subtotal, total_amount, 
          status, created_at, payment_method, shipping_address, notes
        FROM orders 
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (search && search !== "") {
      // Arama filtresi var
      orders = await sql`
        SELECT 
          id, order_number, user_id, subtotal, total_amount, 
          status, created_at, payment_method, shipping_address, notes
        FROM orders 
        WHERE order_number ILIKE ${`%${search}%`}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      // Filtre yok, tüm siparişler
      orders = await sql`
        SELECT 
          id, order_number, user_id, subtotal, total_amount, 
          status, created_at, payment_method, shipping_address, notes
        FROM orders 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

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

          // Shipping address'ten isim ve telefon çıkar
          let customerName = "Bilinmiyor"
          let customerPhone = ""

          if (order.shipping_address && typeof order.shipping_address === "object") {
            customerName = order.shipping_address.name || "Bilinmiyor"
            customerPhone = order.shipping_address.phone || ""
          }

          return {
            id: order.id,
            order_number: order.order_number,
            user_id: order.user_id,
            subtotal: Number.parseFloat(order.subtotal || "0"),
            total_amount: Number.parseFloat(order.total_amount || "0"),
            status: order.status,
            created_at: order.created_at,
            payment_method: order.payment_method,
            notes: order.notes,
            // Kullanıcı bilgileri (önce shipping_address'ten, sonra users tablosundan)
            user_email: user.email || "Bilinmiyor",
            first_name: customerName.split(" ")[0] || user.first_name || "Bilinmiyor",
            last_name: customerName.split(" ").slice(1).join(" ") || user.last_name || "Bilinmiyor",
            user_phone: customerPhone || user.phone || "",
            items: items || [],
          }
        } catch (error) {
          console.error(`❌ Order ${order.id} için detaylar alınamadı:`, error)
          return {
            id: order.id,
            order_number: order.order_number,
            user_id: order.user_id,
            subtotal: Number.parseFloat(order.subtotal || "0"),
            total_amount: Number.parseFloat(order.total_amount || "0"),
            status: order.status,
            created_at: order.created_at,
            payment_method: order.payment_method,
            notes: order.notes,
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
