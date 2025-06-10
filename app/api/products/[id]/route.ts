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

    // Hata durumunda demo ürün döndür
    const demoProduct = getDemoProduct(params.id)

    if (demoProduct) {
      return NextResponse.json({
        success: true,
        product: demoProduct,
      })
    }

    return NextResponse.json({ success: false, error: "Ürün yüklenemedi" }, { status: 500 })
  }
}

// Demo ürün (veritabanı bağlantısı olmadığında)
function getDemoProduct(id: string) {
  const demoProducts = {
    "1": {
      id: "1",
      name: "NFC Bileklik Premium",
      description:
        "Yüksek kaliteli NFC özellikli bileklik. Su geçirmez ve dayanıklı malzemeden üretilmiştir. Telefonunuza yaklaştırdığınızda otomatik olarak bilgilerinizi paylaşır.",
      price: 299.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Bileklikler",
      nfc_enabled: true,
      stock: 10,
      rating: 4.5,
      review_count: 12,
      images: [
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
      ],
      features: [
        "Su geçirmez tasarım",
        "Uzun pil ömrü",
        "Şık ve modern görünüm",
        "Kolay kullanım",
        "Tüm telefonlarla uyumlu",
      ],
      specifications: {
        Malzeme: "Silikon",
        Renk: "Siyah",
        Boyut: "Ayarlanabilir",
        "NFC Tipi": "NTAG213",
        "Pil Ömrü": "5 yıl",
        "Su Geçirmezlik": "IP67",
      },
    },
    "2": {
      id: "2",
      name: "NFC Kolye",
      description:
        "Şık tasarımlı NFC özellikli kolye. Paslanmaz çelik malzemeden üretilmiştir. Telefonunuza yaklaştırdığınızda otomatik olarak bilgilerinizi paylaşır.",
      price: 349.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Kolyeler",
      nfc_enabled: true,
      stock: 8,
      rating: 4.7,
      review_count: 9,
      images: [
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
      ],
      features: ["Paslanmaz çelik", "Şık tasarım", "Uzun zincir", "Tüm telefonlarla uyumlu", "Ayarlanabilir uzunluk"],
      specifications: {
        Malzeme: "Paslanmaz Çelik",
        Renk: "Gümüş",
        "Zincir Uzunluğu": "50cm",
        "NFC Tipi": "NTAG216",
        "Su Geçirmezlik": "Evet",
      },
    },
    "3": {
      id: "3",
      name: "NFC Yüzük",
      description:
        "Modern tasarımlı NFC özellikli yüzük. Seramik malzemeden üretilmiştir. Telefonunuza yaklaştırdığınızda otomatik olarak bilgilerinizi paylaşır.",
      price: 399.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Yüzükler",
      nfc_enabled: true,
      stock: 5,
      rating: 4.3,
      review_count: 6,
      images: [
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
      ],
      features: ["Seramik malzeme", "Şık tasarım", "Farklı boyutlar", "Tüm telefonlarla uyumlu", "Çizilmeye dayanıklı"],
      specifications: {
        Malzeme: "Seramik",
        Renk: "Siyah",
        Boyutlar: "16-22mm",
        "NFC Tipi": "NTAG213",
        "Su Geçirmezlik": "Evet",
      },
    },
    "4": {
      id: "4",
      name: "Özel Tasarım NFC Takı",
      description:
        "Kişiselleştirilmiş NFC takı seçenekleri. İstediğiniz tasarımı seçebilir ve kişiselleştirebilirsiniz.",
      price: 499.99,
      primary_image: "/placeholder.svg?height=400&width=400",
      category_name: "Özel Tasarım",
      nfc_enabled: true,
      stock: 0,
      isCustomDesign: true,
      rating: 4.9,
      review_count: 15,
      images: [
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
        "/placeholder.svg?height=400&width=400",
      ],
      features: [
        "Tamamen kişiselleştirilebilir",
        "Yüksek kalite malzemeler",
        "Özel tasarım seçenekleri",
        "Tüm telefonlarla uyumlu",
        "Hediye paketi seçeneği",
      ],
      specifications: {
        Malzeme: "Çeşitli",
        Renk: "Seçilebilir",
        Boyut: "Özelleştirilebilir",
        "NFC Tipi": "NTAG216",
        "Su Geçirmezlik": "Seçime bağlı",
      },
    },
  }

  return demoProducts[id as keyof typeof demoProducts] || null
}
