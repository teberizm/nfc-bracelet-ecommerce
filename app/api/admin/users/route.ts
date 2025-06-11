export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("Users API çağrısı başladı")

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const offset = (page - 1) * limit

    console.log("Parametreler:", { page, limit, search, offset })

    let users
    let totalResult

    if (search) {
      // Arama ile
      console.log("Arama yapılıyor:", search)

      totalResult = await sql`
        SELECT COUNT(*) as count FROM users 
        WHERE first_name ILIKE ${`%${search}%`} 
        OR last_name ILIKE ${`%${search}%`} 
        OR email ILIKE ${`%${search}%`}
      `

      users = await sql`
        SELECT id, email, first_name, last_name, phone, created_at, is_active
        FROM users 
        WHERE first_name ILIKE ${`%${search}%`} 
        OR last_name ILIKE ${`%${search}%`} 
        OR email ILIKE ${`%${search}%`}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      // Normal listeleme
      console.log("Normal listeleme")

      totalResult = await sql`SELECT COUNT(*) as count FROM users`

      users = await sql`
        SELECT id, email, first_name, last_name, phone, created_at, is_active
        FROM users 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    console.log("Kullanıcı sayısı:", users?.length || 0)

    // Her kullanıcı için sipariş bilgilerini al
    const usersWithStats = []
    for (const user of users) {
      try {
        const orderStats = await sql`
          SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_spent
          FROM orders 
          WHERE user_id = ${user.id}
        `

        usersWithStats.push({
          id: user.id,
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || "",
          created_at: user.created_at,
          is_active: user.is_active,
          total_orders: Number(orderStats[0]?.total_orders || 0),
          total_spent: Number(orderStats[0]?.total_spent || 0),
        })
      } catch (err) {
        console.error("Kullanıcı stats hatası:", err)
        usersWithStats.push({
          id: user.id,
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || "",
          created_at: user.created_at,
          is_active: user.is_active,
          total_orders: 0,
          total_spent: 0,
        })
      }
    }

    const total = Number(totalResult[0]?.count || 0)
    const totalPages = Math.ceil(total / limit)

    console.log("Başarılı response:", usersWithStats.length, "kullanıcı")

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    })
  } catch (error: any) {
    console.error("Users API hatası:", error)

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
