import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { getFreshConnection } from "@/lib/database"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    console.log("=== Admin users API çağrısı başladı ===")
    console.log("Timestamp:", new Date().toISOString())

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

    console.log("Parametreler:", { search, sortBy, sortOrder, limit, offset })

    // Taze bir veritabanı bağlantısı oluştur
    const freshSql = getFreshConnection()
    console.log("Taze veritabanı bağlantısı oluşturuldu")

    // Güvenli sütun adları için whitelist
    const allowedSortColumns = ["created_at", "first_name", "last_name", "email", "updated_at"]
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "created_at"
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC"

    console.log("=== Veritabanından kullanıcılar çekiliyor ===")

    let result

    if (search) {
      // Arama ile kullanıcıları çek
      const searchPattern = `%${search}%`

      if (safeSortBy === "created_at") {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          WHERE (u.first_name ILIKE ${searchPattern} OR u.last_name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.created_at ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (safeSortBy === "first_name") {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          WHERE (u.first_name ILIKE ${searchPattern} OR u.last_name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.first_name ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (safeSortBy === "last_name") {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          WHERE (u.first_name ILIKE ${searchPattern} OR u.last_name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.last_name ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          WHERE (u.first_name ILIKE ${searchPattern} OR u.last_name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.email ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      // Tüm kullanıcıları çek
      if (safeSortBy === "created_at") {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.created_at ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (safeSortBy === "first_name") {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.first_name ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (safeSortBy === "last_name") {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.last_name ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        result = await freshSql`
          SELECT 
            u.id, 
            u.email, 
            u.first_name, 
            u.last_name, 
            u.phone, 
            u.created_at, 
            u.updated_at,
            u.is_active,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, u.updated_at, u.is_active
          ORDER BY u.email ${safeSortOrder === "ASC" ? freshSql`ASC` : freshSql`DESC`}
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    }

    console.log("=== RAW Veritabanı Sonucu ===")
    console.log("Sonuç sayısı:", result.length)
    result.forEach((row, index) => {
      console.log(`Kullanıcı ${index + 1}:`, {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        updated_at: row.updated_at,
        is_active: row.is_active,
      })
    })

    // Verileri formatla
    const users = result.map((row) => {
      const user = {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_active: row.is_active,
        total_orders: Number.parseInt(row.total_orders || "0"),
        total_spent: Number.parseFloat(row.total_spent || "0"),
      }

      console.log("Formatlanmış kullanıcı:", user)
      return user
    })

    console.log("=== API Yanıtı Hazırlanıyor ===")
    console.log("Toplam kullanıcı sayısı:", users.length)

    const response = {
      success: true,
      users,
      timestamp: Date.now(),
      debug: {
        queryTime: new Date().toISOString(),
        userCount: users.length,
      },
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
        "X-Timestamp": Date.now().toString(),
      },
    })
  } catch (error) {
    console.error("=== Admin users hatası ===")
    console.error("Hata:", error)
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
