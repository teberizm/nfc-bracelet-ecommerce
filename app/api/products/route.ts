import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const featured = searchParams.get("featured")

    console.log(`API: Ürünler çekiliyor - limit: ${limit}, offset: ${offset}, featured: ${featured}`)

    let products = await getAllProducts(limit, offset)

    // Eğer sadece öne çıkan ürünler isteniyorsa filtrele
    if (featured === "true") {
      products = products.filter((product) => product.featured === true)
      console.log(`API: ${products.length} öne çıkan ürün filtrelendi`)
    }

    // Ürünleri normalize et
    const normalizedProducts = products.map((product) => ({
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      price: Number(product.price) || 0,
      originalPrice: product.original_price ? Number(product.original_price) : null,
      image: product.primary_image || "/placeholder.svg?height=300&width=300",
      primary_image: product.primary_image || "/placeholder.svg?height=300&width=300",
      description: product.description || "",
      nfc_enabled: Boolean(product.nfc_enabled),
      nfcEnabled: Boolean(product.nfc_enabled),
      stock: Number(product.stock) || 0,
      featured: Boolean(product.featured),
      category: product.category_name || "Genel",
      category_name: product.category_name || "Genel",
      categorySlug: product.category_slug || "genel",
      rating: Number(product.rating) || 4.5,
      reviewCount: Number(product.review_count) || 0,
      review_count: Number(product.review_count) || 0,
      created_at: product.created_at,
    }))

    console.log(`API: ${normalizedProducts.length} ürün başarıyla döndürüldü`)

    return NextResponse.json(normalizedProducts)
  } catch (error) {
    console.error("API: Ürünler çekilirken hata:", error)
    return NextResponse.json({ error: "Ürünler yüklenirken bir hata oluştu" }, { status: 500 })
  }
}
