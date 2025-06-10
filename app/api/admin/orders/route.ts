import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
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
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Sorgu oluştur
    let query = `
      SELECT o.*, 
             u.first_name, u.last_name, u.email as user_email, u.phone as user_phone,
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', oi.product_name,
                 'product_image', oi.product_image,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total_price', oi.total_price,
                 'nfc_enabled', oi.nfc_enabled
               ) ORDER BY oi.created_at
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `

    // Filtreler
    const whereConditions = []
    const queryParams: any[] = []

    if (status) {
      whereConditions.push(`o.status = $${queryParams.length + 1}`)
      queryParams.push(status)
    }

    if (search) {
      whereConditions.push(
        `(o.order_number ILIKE $${queryParams.length + 1} OR 
          u.first_name ILIKE $${queryParams.length + 2} OR 
          u.last_name ILIKE $${queryParams.length + 2} OR 
          u.email ILIKE $${queryParams.length + 2})`,
      )
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    // Gruplama ve sıralama
    query += `
      GROUP BY o.id, u.id
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit, offset)

    // Sorguyu çalıştır
    const orders = await sql.unsafe(query, ...queryParams)

    // Toplam sipariş sayısını al
    let countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(" AND ")}`
    }

    const [totalCount] = await sql.unsafe(countQuery, ...queryParams.slice(0, -2))

    return NextResponse.json({
      success: true,
      orders,
      total: totalCount.total,
    })
  } catch (error) {
    console.error("Error in /api/admin/orders:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
