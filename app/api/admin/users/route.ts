export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    console.log("Users API parametreleri:", { page, limit, search, sortBy, sortOrder, offset })

    let result
    let totalResult

    // Arama varsa
    if (search) {
      console.log("Arama yapılıyor:", search)

      // Arama için toplam sayı
      totalResult = await sql`
        SELECT COUNT(*) as count
        FROM users u
        WHERE 
          u.first_name ILIKE ${`%${search}%`} OR 
          u.last_name ILIKE ${`%${search}%`} OR 
          u.email ILIKE ${`%${search}%`} OR 
          u.phone ILIKE ${`%${search}%`}
      `

      // Sıralama türüne göre arama sorgusu
      if (sortBy === "first_name") {
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
          WHERE 
            u.first_name ILIKE ${`%${search}%`} OR 
            u.last_name ILIKE ${`%${search}%`} OR 
            u.email ILIKE ${`%${search}%`} OR 
            u.phone ILIKE ${`%${search}%`}
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY u.first_name ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortBy === "total_spent") {
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
          WHERE 
            u.first_name ILIKE ${`%${search}%`} OR 
            u.last_name ILIKE ${`%${search}%`} OR 
            u.email ILIKE ${`%${search}%`} OR 
            u.phone ILIKE ${`%${search}%`}
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY total_spent ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
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
          WHERE 
            u.first_name ILIKE ${`%${search}%`} OR 
            u.last_name ILIKE ${`%${search}%`} OR 
            u.email ILIKE ${`%${search}%`} OR 
            u.phone ILIKE ${`%${search}%`}
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY total_orders ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
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
          WHERE 
            u.first_name ILIKE ${`%${search}%`} OR 
            u.last_name ILIKE ${`%${search}%`} OR 
            u.email ILIKE ${`%${search}%`} OR 
            u.phone ILIKE ${`%${search}%`}
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.is_active
          ORDER BY u.created_at ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      // Arama yoksa normal listeleme
      console.log("Normal listeleme yapılıyor")

      // Toplam kullanıcı sayısı
      totalResult = await sql`
        SELECT COUNT(*) as count FROM users
      `

      // Sıralama türüne göre normal sorgu
      if (sortBy === "first_name") {
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
          ORDER BY u.first_name ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortBy === "total_spent") {
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
          ORDER BY total_spent ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
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
          ORDER BY total_orders ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
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
          ORDER BY u.created_at ${sortOrder === "asc" ? sql`ASC` : sql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    }

    console.log("SQL sorgu sonucu:", result?.length || 0, "kullanıcı")
    console.log("Toplam kullanıcı sayısı:", totalResult[0]?.count || 0)

    // Sonuçları kontrol et
    if (!result || !Array.isArray(result)) {
      console.error("SQL sonucu array değil:", result)
      return NextResponse.json({
        success: false,
        message: "Veri formatı hatası",
        users: [],
        total: 0,
        page,
        totalPages: 0,
      })
    }

    // Kullanıcıları normalize et - Frontend'in beklediği format
    const users = result.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      created_at: user.created_at,
      is_active: user.is_active,
      total_orders: Number(user.total_orders || 0),
      total_spent: Number(user.total_spent || 0),
    }))

    const total = Number(totalResult[0]?.count || 0)
    const totalPages = Math.ceil(total / limit)

    console.log("Normalize edilmiş kullanıcılar:", users.length)
    console.log("İlk kullanıcı örneği:", users[0])

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    })
  } catch (error: any) {
    console.error("Users API hatası:", error)
    console.error("Hata detayı:", error.message)
    console.error("Stack trace:", error.stack)

    return NextResponse.json(
      {
        success: false,
        message: "Kullanıcılar çekilirken hata oluştu",
        error: error.message,
        users: [],
        total: 0,
        page: 1,
        totalPages: 0,
      },
      { status: 500 },
    )
  }
}
