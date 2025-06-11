import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin products API başladı")

    // Admin token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token bulunamadı")
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      console.log("Geçersiz token")
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    console.log("Token doğrulandı, ürünler çekiliyor...")

    // Users API'si ile aynı pattern kullanarak basit sorgu
    const result = await sql`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.stock,
        p.nfc_enabled,
        p.is_active,
        p.created_at,
        COALESCE(c.name, 'Kategori Yok') as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `

    console.log("SQL sorgusu tamamlandı, sonuç:", result?.length || 0, "ürün")

    if (!result || !Array.isArray(result)) {
      console.error("SQL sonucu geçersiz:", result)
      return NextResponse.json({
        success: true,
        products: [],
        message: "Veri bulunamadı",
      })
    }

    // Users API'si ile aynı pattern kullanarak veri işleme
    const products = result
      .map((row) => {
        try {
          return {
            id: row.id || "",
            name: row.name || "İsimsiz Ürün",
            slug: row.slug || "",
            price: row.price ? Number.parseFloat(row.price.toString()) : 0,
            stock: row.stock ? Number.parseInt(row.stock.toString()) : 0,
            category_name: row.category_name || "Kategori Yok",
            primary_image: "/placeholder.svg?height=120&width=120&text=" + encodeURIComponent(row.name || "Ürün"),
            is_active: Boolean(row.is_active),
            nfc_enabled: Boolean(row.nfc_enabled),
            created_at: row.created_at || new Date().toISOString(),
          }
        } catch (error) {
          console.error("Ürün işleme hatası:", error)
          return null
        }
      })
      .filter(Boolean) // null değerleri filtrele

    console.log("Ürünler işlendi:", products.length)

    // Users API'si ile aynı response format
    const response = NextResponse.json({
      success: true,
      products: products,
    })

    // Cache kontrolü
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("API Hatası - Detay:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    return NextResponse.json(
      {
        success: false,
        message: "Sunucu hatası oluştu",
        error: error.message,
        details: "Veritabanı bağlantısı veya sorgu hatası",
      },
      { status: 500 },
    )
  }
}
