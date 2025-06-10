import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Demo ürünleri döndür
    const products = getDemoProducts()

    return NextResponse.json({
      success: true,
      products,
    })
  } catch (error) {
    console.error("Error fetching products:", error)

    // Hata durumunda demo ürünleri döndür
    return NextResponse.json({
      success: true,
      products: getDemoProducts(),
    })
  }
}

// Demo ürünler
function getDemoProducts() {
  return [
    {
      id: "1",
      name: "NFC Bileklik Premium",
      description: "Yüksek kaliteli NFC özellikli bileklik",
      price: 299.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Bileklikler",
      nfcEnabled: true,
      stock: 10,
    },
    {
      id: "2",
      name: "NFC Kolye",
      description: "Şık tasarımlı NFC özellikli kolye",
      price: 349.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Kolyeler",
      nfcEnabled: true,
      stock: 8,
    },
    {
      id: "3",
      name: "NFC Yüzük",
      description: "Modern tasarımlı NFC özellikli yüzük",
      price: 399.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Yüzükler",
      nfcEnabled: true,
      stock: 5,
    },
    {
      id: "4",
      name: "Özel Tasarım NFC Takı",
      description: "Kişiselleştirilmiş NFC takı seçenekleri",
      price: 499.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Özel Tasarım",
      nfcEnabled: true,
      stock: 0,
      isCustomDesign: true,
    },
  ]
}
