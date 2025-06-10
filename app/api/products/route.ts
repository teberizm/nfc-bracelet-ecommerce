import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, getProductImages, getProductFeatures, getProductSpecifications } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const category = searchParams.get("category")

    const products = await getAllProducts(limit, offset)

    // Her ürün için ek bilgileri al
    for (const product of products) {
      // Görselleri al
      const images = await getProductImages(product.id)
      product.images = images.map((img: any) => img.image_url)

      // Özellikleri al
      const features = await getProductFeatures(product.id)
      product.features = features.map((f: any) => f.feature_name)

      // Teknik özellikleri al
      const specs = await getProductSpecifications(product.id)
      product.specifications = specs.reduce((acc: any, spec: any) => {
        acc[spec.spec_name] = spec.spec_value
        return acc
      }, {})
    }

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    })
  } catch (error) {
    console.error("Ürünler yüklenirken hata:", error)
    return NextResponse.json({ success: false, error: "Ürünler yüklenemedi" }, { status: 500 })
  }
}
