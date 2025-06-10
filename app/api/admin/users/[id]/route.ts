import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Kullanıcı detayı çekiliyor, ID:", params.id)

    // Kullanıcı bilgilerini çek - kullanıcılar listesi ile aynı mantık
    const userResult = await sql`
      SELECT 
        id,
        name,
        email,
        phone,
        created_at,
        status,
        notes
      FROM users 
      WHERE id = ${params.id}
    `

    console.log("Kullanıcı sorgu sonucu:", userResult)

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ success: false, message: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    const user = userResult[0]

    // Sipariş sayısını çek
    const orderCountResult = await sql`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE user_id = ${params.id}
    `

    // Toplam harcamayı çek
    const totalSpentResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders 
      WHERE user_id = ${params.id}
    `

    // Siparişleri çek
    const ordersResult = await sql`
      SELECT 
        id,
        created_at,
        status,
        total_amount
      FROM orders
      WHERE user_id = ${params.id}
      ORDER BY created_at DESC
    `

    console.log("Sipariş sayısı:", orderCountResult[0]?.count || 0)
    console.log("Toplam harcama:", totalSpentResult[0]?.total || 0)
    console.log("Siparişler:", ordersResult)

    // Verileri normalize et - kullanıcılar listesi ile aynı format
    const userData = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      createdAt: user.created_at,
      lastLogin: null,
      status: user.status || "active",
      totalOrders: Number(orderCountResult[0]?.count || 0),
      totalSpent: Number(totalSpentResult[0]?.total || 0),
      notes: user.notes || "",
    }

    // Siparişleri normalize et
    const orders = ordersResult.map((order) => ({
      id: order.id,
      date: new Date(order.created_at).toLocaleDateString("tr-TR"),
      status: order.status,
      total: Number(order.total_amount || 0),
      products: ["NFC Bileklik"], // Basit ürün adı
    }))

    console.log("Normalize edilmiş kullanıcı:", userData)
    console.log("Normalize edilmiş siparişler:", orders)

    return NextResponse.json({
      success: true,
      user: userData,
      orders: orders,
    })
  } catch (error: any) {
    console.error("Kullanıcı detayı hatası:", error)
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

    console.log("Kullanıcı güncelleniyor:", { name, email, phone, status })

    await sql`
      UPDATE users 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone},
        status = ${status},
        notes = ${notes}
      WHERE id = ${params.id}
    `

    return NextResponse.json({
      success: true,
      message: "Kullanıcı güncellendi",
    })
  } catch (error: any) {
    console.error("Kullanıcı güncelleme hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Güncelleme hatası",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
