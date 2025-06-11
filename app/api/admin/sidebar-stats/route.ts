import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Sidebar stats API çağrısı başladı")

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

    console.log("Admin doğrulandı, sidebar istatistikleri çekiliyor...")

    // Sidebar için gerekli sayıları çek
    let totalUsers = 0
    let totalProducts = 0
    let totalOrders = 0
    let activeNFCContent = 0
    let totalThemes = 0

    try {
      // Toplam kullanıcı sayısı
      const totalUsersResult = await sql`
        SELECT COUNT(*) as count FROM users WHERE is_active = true
      `
      totalUsers = Number.parseInt(totalUsersResult[0]?.count || "0")
      console.log("Sidebar - Total users:", totalUsers)
    } catch (error) {
      console.error("Error fetching sidebar total users:", error)
    }

    try {
      // Toplam ürün sayısı
      const totalProductsResult = await sql`
        SELECT COUNT(*) as count FROM products WHERE is_active = true
      `
      totalProducts = Number.parseInt(totalProductsResult[0]?.count || "0")
      console.log("Sidebar - Total products:", totalProducts)
    } catch (error) {
      console.error("Error fetching sidebar total products:", error)
    }

    try {
      // Toplam sipariş sayısı
      const totalOrdersResult = await sql`
        SELECT COUNT(*) as count FROM orders
      `
      totalOrders = Number.parseInt(totalOrdersResult[0]?.count || "0")
      console.log("Sidebar - Total orders:", totalOrders)
    } catch (error) {
      console.error("Error fetching sidebar total orders:", error)
    }

    try {
      // Aktif NFC içerik sayısı
      const activeNFCContentResult = await sql`
        SELECT COUNT(*) as count FROM nfc_content
      `
      activeNFCContent = Number.parseInt(activeNFCContentResult[0]?.count || "0")
      console.log("Sidebar - Active NFC content:", activeNFCContent)
    } catch (error) {
      console.error("Error fetching sidebar NFC content:", error)
    }

    try {
      // Toplam tema sayısı
      const totalThemesResult = await sql`
        SELECT COUNT(*) as count FROM nfc_themes WHERE is_active = true
      `
      totalThemes = Number.parseInt(totalThemesResult[0]?.count || "0")
      console.log("Sidebar - Total themes:", totalThemes)
    } catch (error) {
      console.error("Error fetching sidebar total themes:", error)
    }

    const sidebarStats = {
      totalUsers,
      totalProducts,
      totalOrders,
      activeNFCContent,
      totalThemes,
    }

    console.log("Sidebar istatistikleri hazırlandı:", sidebarStats)

    return NextResponse.json({
      success: true,
      stats: sidebarStats,
    })
  } catch (error) {
    console.error("Sidebar stats genel hatası:", error)

    // Hata durumunda varsayılan değerler döndür
    const defaultStats = {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      activeNFCContent: 0,
      totalThemes: 0,
    }

    return NextResponse.json({
      success: true,
      stats: defaultStats,
      error: "Sidebar istatistikleri yüklenemedi",
    })
  }
}
