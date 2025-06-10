import { NextResponse } from "next/server"
import { getProductById } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("🔍 API: Fetching product with ID:", id)

    // Önce veritabanından dene
    try {
      const product = await getProductById(id)
      if (product) {
        console.log("✅ API: Product found in database:", product.name)
        return NextResponse.json({
          success: true,
          product: product,
        })
      }
    } catch (dbError) {
      console.error("❌ API: Database error:", dbError)
    }

    // Veritabanında bulunamazsa demo ürünleri dene
    console.log("🔄 API: Trying demo products...")
    const demoProduct = getDemoProduct(id)

    if (demoProduct) {
      console.log("✅ API: Demo product found:", demoProduct.name)
      return NextResponse.json({
        success: true,
        product: demoProduct,
      })
    }

    console.log("❌ API: Product not found anywhere")
    return NextResponse.json({ success: false, error: "Ürün bulunamadı" }, { status: 404 })
  } catch (error) {
    console.error("❌ API: General error:", error)
    return NextResponse.json({ success: false, error: "Ürün yüklenemedi" }, { status: 500 })
  }
}

function getDemoProduct(id: string) {
  const demoProducts = {
    "1": {
      id: "1",
      name: "NFC Bileklik Premium",
      description: "Yüksek kaliteli NFC özellikli bileklik",
      price: 299,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Bileklikler",
      nfc_enabled: true,
      stock: 10,
      rating: 4.5,
      review_count: 12,
    },
    "2": {
      id: "2",
      name: "NFC Kolye",
      description: "Şık tasarımlı NFC özellikli kolye",
      price: 349,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Kolyeler",
      nfc_enabled: true,
      stock: 8,
      rating: 4.7,
      review_count: 9,
    },
    "3": {
      id: "3",
      name: "NFC Yüzük",
      description: "Modern tasarımlı NFC özellikli yüzük",
      price: 399,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Yüzükler",
      nfc_enabled: true,
      stock: 5,
      rating: 4.3,
      review_count: 6,
    },
    "4": {
      id: "4",
      name: "Özel Tasarım NFC Takı",
      description: "Kişiselleştirilmiş NFC takı seçenekleri",
      price: 499,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Özel Tasarım",
      nfc_enabled: true,
      stock: 0,
      isCustomDesign: true,
      rating: 4.9,
      review_count: 15,
    },
  }

  return demoProducts[id as keyof typeof demoProducts] || null
}
