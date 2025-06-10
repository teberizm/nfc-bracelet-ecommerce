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

    // Önce basit bir sorgu ile test edelim
    let query = `SELECT id, email, first_name, last_name, phone, created_at, is_active FROM users`
    const params = []

    if (search) {
      query += ` WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`
      params.push(`%${search}%`)
    }

    // Sıralama
    const validSortColumns = ["created_at", "first_name", "email"]
    const validSortOrders = ["asc", "desc"]

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`
    } else {
      query += ` ORDER BY created_at DESC`
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    console.log("SQL sorgusu:", query)
    console.log("Parametreler:", params)

    // SQL sorgusunu çalıştır
    const result = await sql(query, ...params)

    console.log("Veritabanı sonucu tipi:", typeof result)
    console.log("Veritabanı sonucu:", result)
    console.log("Result.rows var mı?", !!result.rows)
    console.log("Result array mi?", Array.isArray(result))

    // Sonucu normalize et
    let rows = []
    if (Array.isArray(result)) {
      rows = result
    } else if (result && result.rows && Array.isArray(result.rows)) {
      rows = result.rows
    } else if (result && Array.isArray(result.rows)) {
      rows = result.rows
    } else {
      console.error("Beklenmeyen veritabanı sonucu formatı:", result)
      return NextResponse.json({ success: false, message: "Veritabanı sonucu formatı hatalı" }, { status: 500 })
    }

    console.log("İşlenecek satır sayısı:", rows.length)

    // Kullanıcıları formatla
    const users = rows.map((row) => {
      console.log("İşlenen satır:", row)
      return {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        created_at: row.created_at,
        is_active: row.is_active,
        total_orders: 0, // Şimdilik basit tutalım
        total_spent: 0, // Şimdilik basit tutalım
      }
    })

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
