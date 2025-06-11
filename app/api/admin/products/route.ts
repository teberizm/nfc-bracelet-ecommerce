import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Admin products API çağrısı başladı")

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

    // URL parametrelerini al
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Ürünler çekiliyor:", { search, sortBy, sortOrder, limit, offset })

    // Basit ürün sorgusu
    let baseQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.original_price,
        p.stock,
        p.nfc_enabled,
        p.is_active,
        p.weight,
        p.dimensions,
        p.material,
        p.rating,
        p.review_count,
        p.sales_count,
        p.featured,
        p.created_at,
        p.updated_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `

    const params = []

    // Arama filtresi
    if (search) {
      baseQuery += ` AND (p.name ILIKE $${params.length + 1} OR COALESCE(c.name, '') ILIKE $${params.length + 1} OR p.material ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    // Sıralama
    const validSortColumns = ["created_at", "name", "price", "stock", "sales_count", "rating", "updated_at"]
    const validSortOrders = ["asc", "desc"]

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      baseQuery += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`
    } else {
      baseQuery += ` ORDER BY p.created_at DESC`
    }

    baseQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    console.log("SQL Query:", baseQuery)
    console.log("Params:", params)

    const result = await sql(baseQuery, ...params)

    if (!Array.isArray(result)) {
      console.error("SQL sonucu array değil:", result)
      return NextResponse.json({ success: true, products: [] })
    }

    // Ürünleri basit formatta döndür
    const products = result
      .map((product) => {
        try {
          return {
            id: product.id,
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            short_description: product.short_description || "",
            price: product.price ? Number.parseFloat(product.price) : 0,
            original_price: product.original_price ? Number.parseFloat(product.original_price) : null,
            stock: product.stock ? Number.parseInt(product.stock) : 0,
            category_name: product.category_name || "Kategori Yok",
            nfc_enabled: Boolean(product.nfc_enabled),
            is_active: Boolean(product.is_active),
            weight: product.weight || "",
            dimensions: product.dimensions || "",
            material: product.material || "",
            rating: product.rating ? Number.parseFloat(product.rating) : 0,
            review_count: product.review_count ? Number.parseInt(product.review_count) : 0,
            sales_count: product.sales_count ? Number.parseInt(product.sales_count) : 0,
            featured: Boolean(product.featured),
            created_at: product.created_at,
            updated_at: product.updated_at,
            primary_image: "/placeholder.svg?height=120&width=120&text=" + encodeURIComponent(product.name || "Ürün"),
            features: [],
            images: [],
            specifications: [],
          }
        } catch (error) {
          console.error("Ürün işlenirken hata:", error)
          return null
        }
      })
      .filter(Boolean) // null değerleri filtrele

    console.log(`${products.length} ürün başarıyla işlendi`)

    const response = NextResponse.json({
      success: true,
      products,
    })

    // Cache kontrolü
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Admin products hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ürünler çekilirken hata oluştu",
        error: error.message || "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}
