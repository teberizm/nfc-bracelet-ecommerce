import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Kullanıcı detayı çekiliyor, ID:", params.id)

    // Önce sadece kullanıcı bilgilerini çek
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
    console.log("Kullanıcı sorgu sonucu tipi:", typeof userResult)
    console.log("Kullanıcı sorgu sonucu uzunluğu:", userResult?.length)

    if (!userResult || userResult.length === 0) {
      console.log("Kullanıcı bulunamadı")
      return NextResponse.json({ success: false, message: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    const user = userResult[0]
    console.log("Bulunan kullanıcı:", user)

    // Basit sipariş sayısı
    const orderCountResult = await sql`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE user_id = ${params.id}
    `

    console.log("Sipariş sayısı sonucu:", orderCountResult)

    const orderCount = orderCountResult[0]?.count || 0

    // Toplam harcama
    const totalSpentResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders 
      WHERE user_id = ${params.id}
    `

    console.log("Toplam harcama sonucu:", totalSpentResult)

    const totalSpent = totalSpentResult[0]?.total || 0

    // Basit sipariş listesi
    const ordersResult = await sql`
      SELECT 
        id,
        created_at,
        status,
        total_amount
      FROM orders
      WHERE user_id = ${params.id}
      ORDER BY created_at DESC
      LIMIT 10
    `

    console.log("Siparişler sonucu:", ordersResult)

    // Kullanıcı verilerini normalize et
    const userData = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      createdAt: user.created_at,
      lastLogin: null, // Şimdilik null
      status: user.status || "active",
      totalOrders: Number(orderCount) || 0,
      totalSpent: Number(totalSpent) || 0,
      notes: user.notes || "",
    }

    // Siparişleri normalize et
    const orders = (ordersResult || []).map((order) => ({
      id: order.id,
      date: new Date(order.created_at).toISOString().split("T")[0],
      status: order.status || "pending",
      total: Number(order.total_amount) || 0,
      products: ["Ürün bilgisi yükleniyor..."], // Şimdilik basit
    }))

    console.log("Normalize edilmiş kullanıcı verisi:", userData)
    console.log("Normalize edilmiş siparişler:", orders)

    return NextResponse.json({
      success: true,
      user: userData,
      orders: orders,
    })
  } catch (error: any) {
    console.error("Kullanıcı detayı çekilirken hata:", error)
    console.error("Hata mesajı:", error.message)
    console.error("Hata stack:", error.stack)

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
        notes = ${notes}
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
