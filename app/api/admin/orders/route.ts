import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@vercel/postgres"

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
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        o.tracking_number,
        u.email as user_email,
        u.first_name,
        u.last_name,
        u.phone as user_phone,
        o.shipping_address,
        o.billing_address,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_name', p.name,
              'product_image', p.primary_image,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total_price', oi.total_price,
              'nfc_enabled', p.nfc_enabled
            )
          ) FILTER (WHERE oi.id IS NOT NULL), 
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
    `

    const params: any[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push(
        `(o.order_number ILIKE $${params.length + 1} OR u.first_name ILIKE $${params.length + 1} OR u.last_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`,
      )
      params.push(`%${search}%`)
    }

    if (status) {
      conditions.push(`o.status = $${params.length + 1}`)
      params.push(status)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` GROUP BY o.id, o.order_number, o.user_id, o.total_amount, o.status, o.created_at, o.updated_at, o.tracking_number, u.email, u.first_name, u.last_name, u.phone, o.shipping_address, o.billing_address`

    // Sıralama
    const validSortColumns = ["created_at", "total_amount", "status"]
    const validSortOrders = ["asc", "desc"]

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY o.${sortBy} ${sortOrder.toUpperCase()}`
    } else {
      query += ` ORDER BY o.created_at DESC`
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await sql.query(query, params)

    const orders = result.rows.map((row) => ({
      id: row.id,
      order_number: row.order_number,
      user_email: row.user_email,
      first_name: row.first_name,
      last_name: row.last_name,
      user_phone: row.user_phone,
      total_amount: Number.parseFloat(row.total_amount),
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      tracking_number: row.tracking_number,
      shipping_address: row.shipping_address,
      billing_address: row.billing_address,
      items: Array.isArray(row.items) ? row.items : [],
    }))

    console.log(`${orders.length} sipariş çekildi`)

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Admin orders hatası:", error)
    return NextResponse.json({ success: false, message: "Siparişler çekilirken hata oluştu" }, { status: 500 })
  }
}
