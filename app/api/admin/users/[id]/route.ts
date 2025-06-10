import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Kullanıcı detayı çekiliyor, ID:", params.id)

    // Kullanıcı bilgilerini çek
    const userResult = await sql`
      SELECT 
        id,
        name,
        email,
        phone,
        created_at,
        last_login,
        status,
        notes
      FROM users 
      WHERE id = ${params.id}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    const user = userResult[0]

    // Kullanıcının siparişlerini çek
    const ordersResult = await sql`
      SELECT 
        o.id,
        o.created_at,
        o.status,
        o.total_amount,
        array_agg(
          CASE 
            WHEN oi.product_id IS NOT NULL 
            THEN p.name 
            ELSE 'Özel Tasarım'
          END
        ) as products
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ${params.id}
      GROUP BY o.id, o.created_at, o.status, o.total_amount
      ORDER BY o.created_at DESC
    `

    // Toplam sipariş sayısı ve harcama
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spent
      FROM orders 
      WHERE user_id = ${params.id}
    `

    const stats = statsResult[0] || { total_orders: 0, total_spent: 0 }

    // Kullanıcı verilerini normalize et
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      createdAt: user.created_at,
      lastLogin: user.last_login,
      status: user.status || "active",
      totalOrders: Number.parseInt(stats.total_orders) || 0,
      totalSpent: Number.parseFloat(stats.total_spent) || 0,
      notes: user.notes || "",
    }

    // Siparişleri normalize et
    const orders = ordersResult.map((order) => ({
      id: order.id,
      date: new Date(order.created_at).toISOString().split("T")[0],
      status: order.status,
      total: Number.parseFloat(order.total_amount) || 0,
      products: order.products.filter((p) => p !== null),
    }))

    console.log("Kullanıcı detayı başarıyla çekildi:", userData.name)

    return NextResponse.json({
      success: true,
      user: userData,
      orders: orders,
    })
  } catch (error: any) {
    console.error("Kullanıcı detayı çekilirken hata:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Kullanıcı detayı çekilirken hata oluştu",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, email, phone, status, notes } = body

    console.log("Kullanıcı güncelleniyor, ID:", params.id)

    await sql`
      UPDATE users 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone},
        status = ${status},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${params.id}
    `

    console.log("Kullanıcı başarıyla güncellendi")

    return NextResponse.json({
      success: true,
      message: "Kullanıcı başarıyla güncellendi",
    })
  } catch (error: any) {
    console.error("Kullanıcı güncellenirken hata:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Kullanıcı güncellenirken hata oluştu",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
