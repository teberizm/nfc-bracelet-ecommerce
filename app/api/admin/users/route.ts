import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"

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

    // Basit SQL sorgusu kullanarak kullanıcıları çek
    let query = `
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.phone, 
        u.created_at, 
        u.is_active,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
    `

    const whereConditions = []
    const params = []

    if (search) {
      whereConditions.push(`(u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)`)
      params.push(`%${search}%`)
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }

    query += ` GROUP BY u.id`

    // Sıralama
    const validSortColumns = ["created_at", "total_spent", "total_orders", "first_name"]
    const validSortOrders = ["asc", "desc"]

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      if (sortBy === "total_spent") {
        query += ` ORDER BY SUM(COALESCE(o.total_amount, 0)) ${sortOrder}`
      } else if (sortBy === "total_orders") {
        query += ` ORDER BY COUNT(o.id) ${sortOrder}`
      } else {
        query += ` ORDER BY u.${sortBy} ${sortOrder}`
      }
    } else {
      query += ` ORDER BY u.created_at DESC`
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    console.log("SQL sorgusu:", query)
    console.log("Parametreler:", params)

    const result = await sql.unsafe(query, ...params)

    const users = result.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      created_at: row.created_at,
      is_active: row.is_active,
      total_orders: Number.parseInt(row.total_orders || "0"),
      total_spent: Number.parseFloat(row.total_spent || "0"),
    }))

    console.log(`${users.length} kullanıcı çekildi`)

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Admin users hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Kullanıcılar çekilirken hata oluştu",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
