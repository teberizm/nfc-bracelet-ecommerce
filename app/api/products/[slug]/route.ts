import { NextResponse } from "next/server"
import { getProductById } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("🔍 API: Fetching product with ID:", id)
    console.log("🔍 API: Request URL:", request.url)

    // Environment variables kontrol et
    console.log("🔍 API: DATABASE_URL exists:", !!process.env.DATABASE_URL)

    // Önce veritabanından dene
    try {
      console.log("🔍 API: Trying database...")
      const product = await getProductById(id)
      console.log("🔍 API: Database result:", product ? "Found" : "Not found")

      if (product) {
        console.log("✅ API: Product found in database:", {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category_name,
          nfc_enabled: product.nfc_enabled,
          stock: product.stock,
        })

        return NextResponse.json({
          success: true,
          product: product,
        })
      }
    } catch (dbError) {
      console.error("❌ API: Database error:", dbError)
      console.error("❌ API: Database error details:", {
        message: dbError.message,
        stack: dbError.stack,
      })
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
    return NextResponse.json(
      {
        success: false,
        error: "Ürün bulunamadı",
        debug: {
          searchedId: id,
          databaseAttempted: true,
          demoAttempted: true,
        },
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("❌ API: General error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ürün yüklenemedi",
        debug: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      },
      { status: 500 },
    )
  }
}

function getDemoProduct(id: string) {
  const demoProducts = {
    "1": {
      id: "1",
      name: "Premium NFC Deri Bileklik",
      description: "Gerçek deri ve premium NFC teknolojisi ile özel anılarınızı paylaşın.",
      price: 299,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Deri Bileklik",
      nfc_enabled: true,
      stock: 15,
      rating: 4.8,
      review_count: 24,
      features: [
        "Su geçirmez tasarım",
        "Uzun pil ömrü",
        "Şık ve modern görünüm",
        "Kolay kullanım",
        "Tüm telefonlarla uyumlu",
      ],
      specifications: {
        Malzeme: "Gerçek Deri",
        Renk: "Kahverengi",
        Boyut: "Ayarlanabilir",
        "NFC Tipi": "NTAG213",
        "Pil Ömrü": "5 yıl",
        "Su Geçirmezlik": "IP67",
      },
    },
    "2": {
      id: "2",
      name: "Spor NFC Silikon Bileklik",
      description: "Su geçirmez silikon malzeme ile aktif yaşam tarzınıza uygun.",
      price: 199,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Silikon Bileklik",
      nfc_enabled: true,
      stock: 8,
      rating: 4.6,
      review_count: 18,
      features: [
        "Su geçirmez",
        "Esnek silikon malzeme",
        "Spor aktiviteleri için uygun",
        "Kolay temizlenir",
        "Çeşitli renk seçenekleri",
      ],
      specifications: {
        Malzeme: "Silikon",
        Renk: "Siyah",
        Boyut: "S/M/L",
        "NFC Tipi": "NTAG213",
        "Su Geçirmezlik": "IP68",
      },
    },
    "3": {
      id: "3",
      name: "Lüks NFC Metal Bileklik",
      description: "Paslanmaz çelik ve şık tasarım ile özel günleriniz için.",
      price: 499,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Metal Bileklik",
      nfc_enabled: true,
      stock: 3,
      rating: 4.9,
      review_count: 12,
      features: ["Paslanmaz çelik", "Lüks tasarım", "Çizilmeye dayanıklı", "Uzun ömürlü", "Şık görünüm"],
      specifications: {
        Malzeme: "Paslanmaz Çelik",
        Renk: "Gümüş",
        Boyut: "Ayarlanabilir",
        "NFC Tipi": "NTAG216",
        Ağırlık: "45g",
      },
    },
    "4": {
      id: "4",
      name: "Klasik NFC Deri Bileklik",
      description: "Zamansız tasarım ve dayanıklı deri malzeme.",
      price: 249,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Deri Bileklik",
      nfc_enabled: true,
      stock: 12,
      rating: 4.7,
      review_count: 31,
      features: ["Klasik tasarım", "Dayanıklı deri", "Günlük kullanım", "Rahat", "Şık"],
      specifications: {
        Malzeme: "Deri",
        Renk: "Siyah",
        Boyut: "Ayarlanabilir",
        "NFC Tipi": "NTAG213",
      },
    },
  }

  return demoProducts[id as keyof typeof demoProducts] || null
}
