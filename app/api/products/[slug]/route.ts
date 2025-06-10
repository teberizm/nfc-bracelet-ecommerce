import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("🔍 API: Ürün ID'si:", id)

    // Doğrudan SQL sorgusu ile ürünü çekelim
    const result = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images,
             array_agg(DISTINCT pf.feature_name) FILTER (WHERE pf.feature_name IS NOT NULL) as features,
             json_object_agg(ps.spec_name, ps.spec_value) FILTER (WHERE ps.spec_name IS NOT NULL) as specifications
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_features pf ON p.id = pf.product_id
      LEFT JOIN product_specifications ps ON p.id = ps.product_id
      WHERE p.id = ${id}
      GROUP BY p.id, c.id
      LIMIT 1
    `

    console.log("🔍 API: SQL sorgu sonucu:", result.length > 0 ? "Ürün bulundu" : "Ürün bulunamadı")

    if (result.length > 0) {
      const product = result[0]
      console.log("✅ API: Ürün bulundu:", product.name)

      return NextResponse.json({
        success: true,
        product: product,
      })
    }

    // Özel ürünler için kontrol
    if (id === "custom-design") {
      console.log("✅ API: Özel tasarım ürünü")
      return NextResponse.json({
        success: true,
        product: {
          id: "custom-design",
          name: "Kendin Tasarla",
          description:
            "Kendi özel NFC takınızı tasarlayın. İstediğiniz malzeme, renk ve özellikleri seçerek size özel bir ürün oluşturun.",
          price: 499.99,
          primary_image: "/placeholder.svg?height=400&width=400",
          category_name: "Özel Tasarım",
          nfc_enabled: true,
          stock: 999,
          rating: 5.0,
          review_count: 42,
          features: [
            "Tamamen kişiselleştirilebilir",
            "Yüksek kalite malzemeler",
            "Profesyonel tasarım desteği",
            "Hızlı üretim süreci",
            "Ücretsiz kargo",
          ],
          specifications: {
            "Malzeme Seçenekleri": "Deri, Metal, Silikon, Ahşap",
            "Renk Seçenekleri": "Sınırsız",
            "NFC Tipi": "NTAG216 (924 byte)",
            "Üretim Süresi": "3-5 iş günü",
            Garanti: "Ömür boyu",
          },
        },
      })
    }

    // Demo ürünler için kontrol
    const demoProduct = getDemoProduct(id)
    if (demoProduct) {
      console.log("✅ API: Demo ürün bulundu:", demoProduct.name)
      return NextResponse.json({
        success: true,
        product: demoProduct,
      })
    }

    console.log("❌ API: Ürün bulunamadı")
    return NextResponse.json({ success: false, error: "Ürün bulunamadı" }, { status: 404 })
  } catch (error) {
    console.error("❌ API: Genel hata:", error)
    return NextResponse.json({ success: false, error: "Ürün yüklenemedi" }, { status: 500 })
  }
}

function getDemoProduct(id: string) {
  const demoProducts = {
    "1": {
      id: "1",
      name: "Premium NFC Deri Bileklik",
      description: "Gerçek deri ve premium NFC teknolojisi ile özel anılarınızı paylaşın.",
      price: 299.99,
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
      price: 199.99,
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
      price: 499.99,
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
      price: 249.99,
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
