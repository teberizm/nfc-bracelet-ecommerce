import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Token'ı al
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Token'ı doğrula
    const decoded = await verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // İstatistikleri al
    const [totalUsers] = await sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`
    const [totalOrders] = await sql`SELECT COUNT(*) as count FROM orders`
    const [totalRevenue] = await sql`SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders`
    const [pendingOrders] = await sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`
    const [deliveredOrders] = await sql`SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'`
    const [totalProducts] = await sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`
    const [activeNFCContent] = await sql`SELECT COUNT(*) as count FROM nfc_content`

    // Aylık büyüme oranını hesapla
    const [currentMonthRevenue] = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as sum 
      FROM orders 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    `

    const [previousMonthRevenue] = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as sum 
      FROM orders 
      WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      AND created_at < date_trunc('month', CURRENT_DATE)
    `

    let monthlyGrowth = 0
    if (previousMonthRevenue.sum > 0) {
      monthlyGrowth = ((currentMonthRevenue.sum - previousMonthRevenue.sum) / previousMonthRevenue.sum) * 100
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count,
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.sum,
        pendingOrders: pendingOrders.count,
        deliveredOrders: deliveredOrders.count,
        totalProducts: totalProducts.count,
        activeNFCContent: activeNFCContent.count,
        monthlyGrowth,
      },
    })
  } catch (error) {
    console.error("Error in /api/admin/stats:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
