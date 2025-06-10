import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Fetching product with ID:", id)

    // Demo ürün döndür
    const demoProduct = getDemoProduct(id)

    if (demoProduct) {
      return NextResponse.json({
        success: true,
        product: demoProduct,
      })
    }

    return NextResponse.json({ success: false, error: "Ürün bulunamadı" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, error: "Ürün yüklenemedi" }, { status: 500 })
  }
}

function getDemoProduct(id: string) {
  const demoProducts = {
    "1": {
      id: "1",
      name: "NFC Bileklik Premium",
      description: "Yüksek kaliteli NFC özellikli bileklik",
      price: 299.99,
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
      price: 349.99,
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
      price: 399.99,
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
      price: 499.99,
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
