import { type NextRequest, NextResponse } from "next/server"
import { getProductById, getProductBySlug } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    console.log(`🔍 Ürün API çağrısı: ${params.slug}`)

    if (!params.slug) {
      console.log("❌ Slug parametresi eksik")
      return NextResponse.json({ error: "Ürün ID'si gerekli" }, { status: 400 })
    }

    let product = null

    // Önce ID ile dene (UUID formatında ise)
    if (params.slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log("🔍 UUID formatında ID ile aranıyor...")
      product = await getProductById(params.slug)
    } else {
      console.log("🔍 Slug ile aranıyor...")
      product = await getProductBySlug(params.slug)
    }

    if (!product) {
      console.log(`❌ Ürün bulunamadı: ${params.slug}`)
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 })
    }

    console.log("✅ Ürün bulundu:", product.name)
    console.log("📸 Product images:", JSON.stringify(product.product_images, null, 2))
    console.log(
      "🎥 Video 360:",
      product.video_360_url || product.video_360 || "Yok"
    )

    // Resim verilerini detaylı logla
    if (product.product_images && Array.isArray(product.product_images)) {
      console.log(`📸 Toplam ${product.product_images.length} resim bulundu:`)
      product.product_images.forEach((img, index) => {
        console.log(`  ${index + 1}. Resim:`, {
          id: img.id,
          url: img.image_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
        })
      })
    }

    // Response'u logla
    console.log("📤 API Response gönderiliyor...")

    return NextResponse.json(product)
  } catch (error) {
    console.error("❌ Ürün API hatası:", error)
    return NextResponse.json({ error: "Ürün bilgileri alınırken bir hata oluştu" }, { status: 500 })
  }
}
