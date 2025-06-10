import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    console.log("Fetching all products")

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("Query params:", { category, limit, offset })

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.is_active = true
    `

    const queryParams = []

    if (category) {
      query += ` AND c.slug = $${queryParams.length + 1}`
      queryParams.push(category)
    }

    query += `
      GROUP BY p.id, c.id
      ORDER BY p.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit, offset)

    console.log("Executing SQL query")
    const products = await sql.unsafe(query, ...queryParams)
    console.log(`Found ${products.length} products`)

    // Demo ürünleri ekle (veritabanı boşsa)
    let finalProducts = products
    if (products.length === 0) {
      console.log("No products found in database, adding demo products")
      finalProducts = getDemoProducts()
    }

    return NextResponse.json({
      success: true,
      products: finalProducts,
    })
  } catch (error) {
    console.error("Error fetching products:", error)

    // Hata durumunda demo ürünleri döndür
    const demoProducts = getDemoProducts()

    return NextResponse.json({
      success: true,
      products: demoProducts,
      message: "Demo ürünler gösteriliyor (veritabanı hatası)",
    })
  }
}

// Demo ürünler (veritabanı bağlantısı olmadığında)
function getDemoProducts() {
  return [
    {
      id: "1",
      name: "NFC Bileklik Premium",
      description: "Yüksek kaliteli NFC özellikli bileklik",
      price: 299.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Bileklikler",
      nfc_enabled: true,
      stock: 10,
      images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    },
    {
      id: "2",
      name: "NFC Kolye",
      description: "Şık tasarımlı NFC özellikli kolye",
      price: 349.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Kolyeler",
      nfc_enabled: true,
      stock: 8,
      images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    },
    {
      id: "3",
      name: "NFC Yüzük",
      description: "Modern tasarımlı NFC özellikli yüzük",
      price: 399.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Yüzükler",
      nfc_enabled: true,
      stock: 5,
      images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    },
    {
      id: "4",
      name: "Özel Tasarım NFC Takı",
      description: "Kişiselleştirilmiş NFC takı seçenekleri",
      price: 499.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Özel Tasarım",
      nfc_enabled: true,
      stock: 0,
      isCustomDesign: true,
      images: ["/placeholder.svg?height=400&width=400", "/placeholder.svg?height=400&width=400"],
    },
  ]
}
