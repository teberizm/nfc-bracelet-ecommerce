import { NextResponse } from "next/request"
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
    const category = searchParams.get("category") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Ürünler çekiliyor:", { search, category, sortBy, sortOrder, limit, offset })

    // Ürünleri çek
    let query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.stock,
        p.primary_image,
        p.is_active,
        p.nfc_enabled,
        p.featured,
        p.created_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `

    const params = []

    if (search) {
      query += ` AND (p.name ILIKE $${params.length + 1} OR c.name ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    if (category) {
      query += ` AND c.slug = $${params.length + 1}`
      params.push(category)
    }

    // Sıralama
    const validSortColumns = ["created_at", "name", "price", "stock"]
    const validSortOrders = ["asc", "desc"]

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`
    } else {
      query += ` ORDER BY p.created_at DESC`
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await sql(query, ...params)

    const products = result.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: Number.parseFloat(row.price),
      stock: Number.parseInt(row.stock),
      category_name: row.category_name || "Kategori Yok",
      primary_image: row.primary_image,
      is_active: row.is_active,
      nfc_enabled: row.nfc_enabled,
      featured: row.featured,
      created_at: row.created_at,
    }))

    console.log(`${products.length} ürün çekildi`)

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error("Admin products hatası:", error)
    return NextResponse.json(
      { success: false, message: "Ürünler çekilirken hata oluştu", error: error.message },
      { status: 500 },
    )
  }
}
