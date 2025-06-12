import { type NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/products"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const featured = searchParams.get("featured")

    console.log(`API: Ürünler çekiliyor - limit: ${limit}, offset: ${offset}, featured: ${featured}`)

    let products = await getProducts(limit, offset)

    // Eğer sadece öne çıkan ürünler isteniyorsa filtrele
    if (featured === "true") {
      products = products.filter((product) => product.featured === true)
      console.log(`API: ${products.length} öne çıkan ürün filtrelendi`)
    }

    // Ürünleri normalize et
    console.log(`API: ${products.length} ürün çekildi`)

    return NextResponse.json(products)
  } catch (error) {
    console.error("API: Ürünler çekilirken hata:", error)
    return NextResponse.json({ error: "Ürünler yüklenirken bir hata oluştu" }, { status: 500 })
  }
}
 