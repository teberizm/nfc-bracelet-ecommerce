import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin stats API çağrısı başladı")

    // Admin token'ını doğrula
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Admin stats: Authorization header eksik")
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      console.log("Admin stats: Token geçersiz")
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    console.log("Admin stats: Token doğrulandı, istatistikler çekiliyor...")

    // İstatistikleri veritabanından çek
    const [
      usersResult,
      ordersResult,
      revenueResult,
      pendingOrdersResult,
      deliveredOrdersResult,
      productsResult,
      nfcContentResult,
    ] = await Promise.all([
      // Toplam kullanıcı sayısı
      sql`SELECT COUNT(*) as count FROM users`,

      // Toplam sipariş sayısı
      sql`SELECT COUNT(*) as count FROM orders`,

      // Toplam gelir
      sql`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'delivered'`,

      // Bekleyen siparişler
      sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`,

      // Teslim edilen siparişler
      sql`SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'`,

      // Toplam ürün sayısı
      sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`,

      // Aktif NFC içerik sayısı
      sql`SELECT COUNT(*) as count FROM nfc_content WHERE is_active = true`,
    ])

    // Aylık büyüme hesapla (basit bir hesaplama)
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const currentMonthOrders = await sql`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE EXTRACT(MONTH FROM created_at) = ${currentMonth} 
      AND EXTRACT(YEAR FROM created_at) = ${currentYear}
    `

    const lastMonthOrders = await sql`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE EXTRACT(MONTH FROM created_at) = ${currentMonth - 1 || 12} 
      AND EXTRACT(YEAR FROM created_at) = ${currentMonth === 1 ? currentYear - 1 : currentYear}
    `

    const currentCount = Number.parseInt(currentMonthOrders.rows[0]?.count || "0")
    const lastCount = Number.parseInt(lastMonthOrders.rows[0]?.count || "0")
    const monthlyGrowth = lastCount > 0 ? Math.round(((currentCount - lastCount) / lastCount) * 100) : 0

    const stats = {
      totalUsers: Number.parseInt(usersResult.rows[0]?.count || "0"),
      totalOrders: Number.parseInt(ordersResult.rows[0]?.count || "0"),
      totalRevenue: Number.parseFloat(revenueResult.rows[0]?.total || "0"),
      pendingOrders: Number.parseInt(pendingOrdersResult.rows[0]?.count || "0"),
      deliveredOrders: Number.parseInt(deliveredOrdersResult.rows[0]?.count || "0"),
      totalProducts: Number.parseInt(productsResult.rows[0]?.count || "0"),
      activeNFCContent: Number.parseInt(nfcContentResult.rows[0]?.count || "0"),
      monthlyGrowth: monthlyGrowth,
    }

    console.log("Admin stats başarıyla çekildi:", stats)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Admin stats hatası:", error)
    return NextResponse.json({ success: false, message: "İstatistikler çekilirken hata oluştu" }, { status: 500 })
  }
}
