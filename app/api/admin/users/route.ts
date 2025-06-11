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

    // Build the base query
    let baseQuery = `
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

    // Add search condition if provided
    if (search) {
      console.log("Arama ile kullanıcılar çekiliyor:", search)
      baseQuery += ` WHERE (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)`
    } else {
      console.log("Tüm kullanıcılar çekiliyor")
    }

    baseQuery += ` GROUP BY u.id`

    // Add sorting
    let orderByClause = ""
    switch (sortBy) {
      case "created_at":
        orderByClause = ` ORDER BY u.created_at ${sortOrder.toUpperCase()}`
        break
      case "first_name":
        orderByClause = ` ORDER BY u.first_name ${sortOrder.toUpperCase()}`
        break
      case "total_spent":
        orderByClause = ` ORDER BY total_spent ${sortOrder.toUpperCase()}`
        break
      case "total_orders":
        orderByClause = ` ORDER BY total_orders ${sortOrder.toUpperCase()}`
        break
      default:
        orderByClause = ` ORDER BY u.created_at DESC`
    }

    baseQuery += orderByClause
    baseQuery += ` LIMIT $${search ? "2" : "1"} OFFSET $${search ? "3" : "2"}`

    // Execute query with proper parameters
    let result
    if (search) {
      result = await sql.unsafe(baseQuery, `%${search}%`, limit, offset)
    } else {
      result = await sql.unsafe(baseQuery, limit, offset)
    }

    console.log("Veritabanı sonucu:", result)
    console.log("Sonuç tipi:", typeof result)
    console.log("Array mi?", Array.isArray(result))

    // Neon'dan gelen sonuç zaten array formatında
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

    console.log(`${users.length} kullanıcı formatlandı`)

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Admin users hatası:", error)
    console.error("Hata stack:", error.stack)
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
