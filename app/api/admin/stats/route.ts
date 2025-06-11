import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin stats API çağrısı başladı")

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

    console.log("Admin doğrulandı, istatistikler çekiliyor...")

    // Toplam kullanıcı sayısı
    const totalUsersResult = await sql`
      SELECT COUNT(*) as count FROM users WHERE is_active = true
    `
    const totalUsers = Number.parseInt(totalUsersResult[0].count)

    // Toplam sipariş sayısı
    const totalOrdersResult = await sql`
      SELECT COUNT(*) as count FROM orders
    `
    const totalOrders = Number.parseInt(totalOrdersResult[0].count)

    // Toplam gelir
    const totalRevenueResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'
    `
    const totalRevenue = Number.parseFloat(totalRevenueResult[0].total)

    // Bekleyen siparişler
    const pendingOrdersResult = await sql`
      SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
    `
    const pendingOrders = Number.parseInt(pendingOrdersResult[0].count)

    // Teslim edilen siparişler
    const deliveredOrdersResult = await sql`
      SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'
    `
    const deliveredOrders = Number.parseInt(deliveredOrdersResult[0].count)

    // Toplam ürün sayısı
    const totalProductsResult = await sql`
      SELECT COUNT(*) as count FROM products WHERE is_active = true
    `
    const totalProducts = Number.parseInt(totalProductsResult[0].count)

    // Aktif NFC içerik sayısı
    const activeNFCContentResult = await sql`
      SELECT COUNT(*) as count FROM nfc_content
    `
    const activeNFCContent = Number.parseInt(activeNFCContentResult[0].count)

    // Bu ay eklenen kullanıcılar
    const thisMonthUsersResult = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE is_active = true 
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `
    const thisMonthUsers = Number.parseInt(thisMonthUsersResult[0].count)

    // Geçen ay eklenen kullanıcılar
    const lastMonthUsersResult = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE is_active = true 
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `
    const lastMonthUsers = Number.parseInt(lastMonthUsersResult[0].count)

    // Kullanıcı büyüme oranı
    const userGrowthRate = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

    // Tema kullanım istatistikleri
    const themeUsageResult = await sql`
      SELECT 
        t.name as theme_name, 
        COUNT(nc.id) as usage_count
      FROM nfc_themes t
      LEFT JOIN nfc_content nc ON nc.theme = t.slug
      GROUP BY t.name
      ORDER BY usage_count DESC
      LIMIT 5
    `

    // Son 7 günlük sipariş istatistikleri
    const last7DaysOrdersResult = await sql`
      SELECT 
        DATE_TRUNC('day', created_at) as order_date,
        COUNT(*) as order_count,
        SUM(total_amount) as daily_revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY order_date
    `

    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      activeNFCContent,
      monthlyGrowth: Math.round(userGrowthRate * 100) / 100,
      themeUsage: themeUsageResult,
      last7DaysOrders: last7DaysOrdersResult,
    }

    console.log("İstatistikler hazırlandı:", stats)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Admin stats hatası:", error)
    return NextResponse.json(
      { success: false, message: "İstatistikler çekilirken hata oluştu", error: error.message },
      { status: 500 },
    )
  }
}
