import { type NextRequest, NextResponse } from "next/server"
import { getProductBySlug, getProductImages, getProductFeatures, getProductSpecifications } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug)

    if (!product) {
      return NextResponse.json({ success: false, error: "Ürün bulunamadı" }, { status: 404 })
    }

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

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("Ürün yüklenirken hata:", error)
    return NextResponse.json({ success: false, error: "Ürün yüklenemedi" }, { status: 500 })
  }
}
