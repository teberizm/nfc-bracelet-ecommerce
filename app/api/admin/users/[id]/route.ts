export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Kullanıcı detayı çekiliyor, ID:", params.id)

    // Connection pooling sorununu çözmek için kısa bir bekleme
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Kullanıcı bilgilerini çek - gerçek sütun isimleri ile
    const userResult = await sql`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        avatar_url,
        email_verified,
        is_active,
        created_at,
        updated_at
      FROM users 
      WHERE id = ${params.id}
    `

    console.log("Veritabanından çekilen RAW veri:", userResult[0])

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

    // Verileri normalize et - gerçek sütunlara göre
    const userData = {
      id: user.id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar_url || "",
      emailVerified: user.email_verified || false,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: null, // Bu sütun yok, null yapıyoruz
      status: user.is_active ? "active" : "inactive",
      totalOrders: Number(orderCountResult[0]?.count || 0),
      totalSpent: Number(totalSpentResult[0]?.total || 0),
      notes: "", // Bu sütun yok, boş string yapıyoruz
    }

    console.log("Normalize edilmiş kullanıcı:", userData)
    console.log("İsim birleştirme:", `"${user.first_name}" + " " + "${user.last_name}" = "${userData.name}"`)

    // Siparişleri normalize et
    const orders = ordersResult.map((order) => ({
      id: order.id,
      date: new Date(order.created_at).toLocaleDateString("tr-TR"),
      status: order.status,
      total: Number(order.total_amount || 0),
      products: ["NFC Bileklik"], // Basit ürün adı
    }))

    // Cache-busting header'ları ekle
    return NextResponse.json(
      {
        success: true,
        user: userData,
        orders: orders,
        timestamp: Date.now(), // Her seferinde farklı bir response için
        debug: {
          rawFirstName: user.first_name,
          rawLastName: user.last_name,
          combinedName: userData.name,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      },
    )
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
    const { name, email, phone, status } = body

    console.log("=== Kullanıcı güncelleme başladı ===")
    console.log("Gelen veriler:", { name, email, phone, status })
    console.log("Kullanıcı ID:", params.id)

    // İsmi parçalara ayır
    const nameParts = name.split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    console.log("Parçalanmış isim:", { firstName, lastName })

    // Önce mevcut veriyi kontrol et
    const beforeUpdate = await sql`
      SELECT first_name, last_name, email, phone, is_active 
      FROM users 
      WHERE id = ${params.id}
    `
    console.log("Güncelleme öncesi veri:", beforeUpdate[0])

    // Güncelleme yap
    const updateResult = await sql`
      UPDATE users 
      SET 
        first_name = ${firstName},
        last_name = ${lastName},
        email = ${email},
        phone = ${phone},
        is_active = ${status === "active"},
        updated_at = NOW()
      WHERE id = ${params.id}
    `

    console.log("UPDATE sorgu sonucu:", updateResult)

    // Güncelleme sonrası veriyi kontrol et - AYNI CONNECTION'DA
    const afterUpdate = await sql`
      SELECT first_name, last_name, email, phone, is_active, updated_at
      FROM users 
      WHERE id = ${params.id}
    `
    console.log("Güncelleme sonrası veri:", afterUpdate[0])

    console.log("=== Kullanıcı güncelleme tamamlandı ===")

    return NextResponse.json({
      success: true,
      message: "Kullanıcı güncellendi",
      before: beforeUpdate[0],
      after: afterUpdate[0],
    })
  } catch (error: any) {
    console.error("=== Kullanıcı güncelleme hatası ===")
    console.error("Hata:", error)
    console.error("Hata mesajı:", error.message)
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
