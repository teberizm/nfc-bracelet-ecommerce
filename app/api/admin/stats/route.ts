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

    // Her sorguyu try-catch ile sarmalayalım
    let totalUsers = 0
    let totalOrders = 0
    let totalRevenue = 0
    let pendingOrders = 0
    let deliveredOrders = 0
    let totalProducts = 0
    let activeNFCContent = 0
    let thisMonthUsers = 0
    let lastMonthUsers = 0
    let themeUsageResult = []
    let last7DaysOrdersResult = []

    try {
      // Toplam kullanıcı sayısı
      const totalUsersResult = await sql`
        SELECT COUNT(*) as count FROM users WHERE is_active = true
      `
      totalUsers = Number.parseInt(totalUsersResult[0]?.count || "0")
      console.log("Total users:", totalUsers)
    } catch (error) {
      console.error("Error fetching total users:", error)
    }

    try {
      // Toplam sipariş sayısı
      const totalOrdersResult = await sql`
        SELECT COUNT(*) as count FROM orders
      `
      totalOrders = Number.parseInt(totalOrdersResult[0]?.count || "0")
      console.log("Total orders:", totalOrders)
    } catch (error) {
      console.error("Error fetching total orders:", error)
    }

    try {
      // Toplam gelir
      const totalRevenueResult = await sql`
        SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'
      `
      totalRevenue = Number.parseFloat(totalRevenueResult[0]?.total || "0")
      console.log("Total revenue:", totalRevenue)
    } catch (error) {
      console.error("Error fetching total revenue:", error)
    }

    try {
      // Bekleyen siparişler
      const pendingOrdersResult = await sql`
        SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
      `
      pendingOrders = Number.parseInt(pendingOrdersResult[0]?.count || "0")
      console.log("Pending orders:", pendingOrders)
    } catch (error) {
      console.error("Error fetching pending orders:", error)
    }

    try {
      // Teslim edilen siparişler
      const deliveredOrdersResult = await sql`
        SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'
      `
      deliveredOrders = Number.parseInt(deliveredOrdersResult[0]?.count || "0")
      console.log("Delivered orders:", deliveredOrders)
    } catch (error) {
      console.error("Error fetching delivered orders:", error)
    }

    try {
      // Toplam ürün sayısı
      const totalProductsResult = await sql`
        SELECT COUNT(*) as count FROM products WHERE is_active = true
      `
      totalProducts = Number.parseInt(totalProductsResult[0]?.count || "0")
      console.log("Total products:", totalProducts)
    } catch (error) {
      console.error("Error fetching total products:", error)
    }

    try {
      // Aktif NFC içerik sayısı
      const activeNFCContentResult = await sql`
        SELECT COUNT(*) as count FROM nfc_content
      `
      activeNFCContent = Number.parseInt(activeNFCContentResult[0]?.count || "0")
      console.log("Active NFC content:", activeNFCContent)
    } catch (error) {
      console.error("Error fetching NFC content:", error)
    }

    try {
      // Bu ay eklenen kullanıcılar
      const thisMonthUsersResult = await sql`
        SELECT COUNT(*) as count FROM users 
        WHERE is_active = true 
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      `
      thisMonthUsers = Number.parseInt(thisMonthUsersResult[0]?.count || "0")
      console.log("This month users:", thisMonthUsers)
    } catch (error) {
      console.error("Error fetching this month users:", error)
    }

    try {
      // Geçen ay eklenen kullanıcılar
      const lastMonthUsersResult = await sql`
        SELECT COUNT(*) as count FROM users 
        WHERE is_active = true 
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      `
      lastMonthUsers = Number.parseInt(lastMonthUsersResult[0]?.count || "0")
      console.log("Last month users:", lastMonthUsers)
    } catch (error) {
      console.error("Error fetching last month users:", error)
    }

    try {
      // Tema kullanım istatistikleri - sadece mevcut temalar varsa
      const themeUsageQuery = await sql`
        SELECT 
          t.name as theme_name, 
          COALESCE(COUNT(nc.id), 0) as usage_count
        FROM nfc_themes t
        LEFT JOIN nfc_content nc ON nc.theme = t.slug
        WHERE t.is_active = true
        GROUP BY t.name, t.id
        ORDER BY usage_count DESC
        LIMIT 5
      `
      themeUsageResult = themeUsageQuery || []
      console.log("Theme usage:", themeUsageResult)
    } catch (error) {
      console.error("Error fetching theme usage:", error)
      themeUsageResult = []
    }

    try {
      // Son 7 günlük sipariş istatistikleri
      const last7DaysQuery = await sql`
        SELECT 
          DATE_TRUNC('day', created_at) as order_date,
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount), 0) as daily_revenue
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY order_date
      `
      last7DaysOrdersResult = last7DaysQuery || []
      console.log("Last 7 days orders:", last7DaysOrdersResult)
    } catch (error) {
      console.error("Error fetching last 7 days orders:", error)
      last7DaysOrdersResult = []
    }

    // Kullanıcı büyüme oranı
    const userGrowthRate = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

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
    console.error("Admin stats genel hatası:", error)

    // Hata durumunda varsayılan değerler döndür
    const defaultStats = {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalProducts: 0,
      activeNFCContent: 0,
      monthlyGrowth: 0,
      themeUsage: [],
      last7DaysOrders: [],
    }

    return NextResponse.json({
      success: true,
      stats: defaultStats,
      error: "Bazı istatistikler yüklenemedi, varsayılan değerler gösteriliyor",
    })
  }
}
