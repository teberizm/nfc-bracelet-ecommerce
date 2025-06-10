import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin users API çağrısı başladı")

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
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Kullanıcılar çekiliyor:", { search, sortBy, sortOrder, limit, offset })

    // Kullanıcıları çek
    let query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.created_at,
        u.is_active,
        COALESCE(COUNT(o.id), 0) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
    `

    const params: any[] = []

    if (search) {
      query += ` WHERE (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)`
      params.push(`%${search}%`)
    }

    query += ` GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active`

    // Sıralama
    const validSortColumns = ["created_at", "total_spent", "total_orders", "first_name"]
    const validSortOrders = ["asc", "desc"]

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`
    } else {
      query += ` ORDER BY created_at DESC`
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await sql.query(query, params)

    const users = result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      created_at: row.created_at,
      is_active: row.is_active,
      total_orders: Number.parseInt(row.total_orders),
      total_spent: Number.parseFloat(row.total_spent),
    }))

    console.log(`${users.length} kullanıcı çekildi`)

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Admin users hatası:", error)
    return NextResponse.json({ success: false, message: "Kullanıcılar çekilirken hata oluştu" }, { status: 500 })
  }
}
