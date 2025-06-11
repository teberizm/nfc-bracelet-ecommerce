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

    let result

    // Arama varsa
    if (search) {
      console.log("Arama ile kullanıcılar çekiliyor:", search)

      // Sıralama türüne göre sorgu
      if (sortBy === "total_spent") {
        result = await sql`
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
          WHERE (u.first_name ILIKE ${`%${search}%`} OR u.last_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY total_spent ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortBy === "total_orders") {
        result = await sql`
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
          WHERE (u.first_name ILIKE ${`%${search}%`} OR u.last_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY total_orders ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortBy === "first_name") {
        result = await sql`
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
          WHERE (u.first_name ILIKE ${`%${search}%`} OR u.last_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY u.first_name ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        // created_at veya diğer durumlar
        result = await sql`
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
          WHERE (u.first_name ILIKE ${`%${search}%`} OR u.last_name ILIKE ${`%${search}%`} OR u.email ILIKE ${`%${search}%`})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY u.created_at ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      // Arama yoksa
      console.log("Tüm kullanıcılar çekiliyor")

      if (sortBy === "total_spent") {
        result = await sql`
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
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY total_spent ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortBy === "total_orders") {
        result = await sql`
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
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY total_orders ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortBy === "first_name") {
        result = await sql`
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
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY u.first_name ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        // created_at veya diğer durumlar
        result = await sql`
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
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY u.created_at ${sql.unsafe(sortOrder.toUpperCase())}
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    }

    console.log("Veritabanı sonucu:", result)
    console.log("Sonuç tipi:", typeof result)
    console.log("Array mi?", Array.isArray(result))

    // Sonucun array olduğundan emin ol
    if (!Array.isArray(result)) {
      console.error("Sonuç array değil:", result)
      return NextResponse.json({
        success: true,
        users: [],
      })
    }

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
