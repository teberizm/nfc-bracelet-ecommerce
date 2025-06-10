import { getAllProducts as getProductsFromDB } from "@/lib/database"

// Fallback ürün verisi
const fallbackProducts = [
  {
    id: "1",
    name: "Premium NFC Deri Bileklik",
    slug: "premium-nfc-deri-bileklik",
    price: 299,
    originalPrice: 399,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Gerçek deri ve premium NFC teknolojisi ile özel anılarınızı paylaşın.",
    nfc_enabled: true,
    stock: 15,
    featured: true,
    category_name: "Deri Bileklik",
    category: "Deri Bileklik",
    categorySlug: "deri-bileklik",
    rating: 4.8,
    reviewCount: 24,
    review_count: 24,
    created_at: new Date().toISOString(),
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    features: ["Gerçek deri malzeme", "Su geçirmez NFC çip", "Ayarlanabilir boyut", "Şık metal toka", "2 yıl garanti"],
    specifications: {
      Malzeme: "Gerçek Deri",
      "NFC Tipi": "NTAG216",
      "Su Geçirmezlik": "IP67",
      Pil: "Yok (Pasif NFC)",
      Uyumluluk: "Tüm NFC uyumlu cihazlar",
    },
    nfcFeatures: [
      "Sosyal medya profilleri paylaşma",
      "Dijital kartvizit",
      "Özel mesaj veya anı",
      "Web sitesi yönlendirme",
      "Konum paylaşımı",
    ],
    video360: null,
  },
  {
    id: "2",
    name: "Spor NFC Silikon Bileklik",
    slug: "spor-nfc-silikon-bileklik",
    price: 199,
    originalPrice: 249,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Su geçirmez silikon malzeme ile aktif yaşam tarzınıza uygun.",
    nfc_enabled: true,
    stock: 8,
    featured: false,
    category_name: "Silikon Bileklik",
    category: "Silikon Bileklik",
    categorySlug: "silikon-bileklik",
    rating: 4.6,
    reviewCount: 18,
    review_count: 18,
    created_at: new Date().toISOString(),
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    features: [
      "Esnek silikon malzeme",
      "Su geçirmez yapı",
      "Ayarlanabilir boyut",
      "Hafif tasarım",
      "Spor aktivitelere uygun",
    ],
    specifications: {
      Malzeme: "Silikon",
      "NFC Tipi": "NTAG213",
      "Su Geçirmezlik": "IP68",
      Pil: "Yok (Pasif NFC)",
      Uyumluluk: "Tüm NFC uyumlu cihazlar",
    },
    nfcFeatures: [
      "Sosyal medya profilleri paylaşma",
      "Spor aktivite takibi",
      "Acil durum bilgileri",
      "Web sitesi yönlendirme",
    ],
    video360: null,
  },
  {
    id: "3",
    name: "Lüks NFC Metal Bileklik",
    slug: "luks-nfc-metal-bileklik",
    price: 499,
    originalPrice: 599,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Paslanmaz çelik ve şık tasarım ile özel günleriniz için.",
    nfc_enabled: true,
    stock: 3,
    featured: true,
    category_name: "Metal Bileklik",
    category: "Metal Bileklik",
    categorySlug: "metal-bileklik",
    rating: 4.9,
    reviewCount: 12,
    review_count: 12,
    created_at: new Date().toISOString(),
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    features: [
      "Premium paslanmaz çelik",
      "Lüks görünüm",
      "Dayanıklı yapı",
      "Ayarlanabilir boyut",
      "Özel tasarım kutusu",
    ],
    specifications: {
      Malzeme: "316L Paslanmaz Çelik",
      "NFC Tipi": "NTAG216",
      "Su Geçirmezlik": "IP67",
      Pil: "Yok (Pasif NFC)",
      Uyumluluk: "Tüm NFC uyumlu cihazlar",
    },
    nfcFeatures: [
      "Dijital kartvizit",
      "Sosyal medya profilleri",
      "Özel mesaj veya anı",
      "Web sitesi yönlendirme",
      "Konum paylaşımı",
    ],
    video360: null,
  },
  {
    id: "4",
    name: "Klasik NFC Deri Bileklik",
    slug: "klasik-nfc-deri-bileklik",
    price: 249,
    originalPrice: 299,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Zamansız tasarım ve dayanıklı deri malzeme.",
    nfc_enabled: true,
    stock: 12,
    featured: false,
    category_name: "Deri Bileklik",
    category: "Deri Bileklik",
    categorySlug: "deri-bileklik",
    rating: 4.7,
    reviewCount: 31,
    review_count: 31,
    created_at: new Date().toISOString(),
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    features: [
      "Klasik deri tasarım",
      "Dayanıklı yapı",
      "Ayarlanabilir boyut",
      "Şık metal toka",
      "Günlük kullanıma uygun",
    ],
    specifications: {
      Malzeme: "İşlenmiş Deri",
      "NFC Tipi": "NTAG213",
      "Su Geçirmezlik": "IP65",
      Pil: "Yok (Pasif NFC)",
      Uyumluluk: "Tüm NFC uyumlu cihazlar",
    },
    nfcFeatures: ["Sosyal medya profilleri paylaşma", "Dijital kartvizit", "Web sitesi yönlendirme", "Konum paylaşımı"],
    video360: null,
  },
  {
    id: "5",
    name: "Renkli NFC Silikon Bileklik",
    slug: "renkli-nfc-silikon-bileklik",
    price: 179,
    originalPrice: 229,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Çeşitli renk seçenekleri ile kişisel tarzınızı yansıtın.",
    nfc_enabled: true,
    stock: 25,
    featured: false,
    category_name: "Silikon Bileklik",
    category: "Silikon Bileklik",
    categorySlug: "silikon-bileklik",
    rating: 4.5,
    reviewCount: 45,
    review_count: 45,
    created_at: new Date().toISOString(),
    images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    features: [
      "Renkli silikon malzeme",
      "Su geçirmez yapı",
      "Ayarlanabilir boyut",
      "Hafif tasarım",
      "Günlük kullanıma uygun",
    ],
    specifications: {
      Malzeme: "Silikon",
      "NFC Tipi": "NTAG213",
      "Su Geçirmezlik": "IP68",
      Pil: "Yok (Pasif NFC)",
      Uyumluluk: "Tüm NFC uyumlu cihazlar",
    },
    nfcFeatures: ["Sosyal medya profilleri paylaşma", "Dijital kartvizit", "Web sitesi yönlendirme"],
    video360: null,
  },
]

export async function getProducts(limit = 50, offset = 0) {
  try {
    console.log("Veritabanından ürünler çekiliyor...")
    const products = await getProductsFromDB(limit, offset)
    console.log(`✅ ${products.length} ürün başarıyla çekildi`)
    return products
  } catch (error) {
    console.error("❌ Veritabanı hatası, fallback veriler kullanılıyor:", error)
    // Veritabanı hatası durumunda fallback verilerini döndür
    return fallbackProducts.slice(offset, offset + limit)
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const { getProductBySlug: getProductBySlugFromDB } = await import("@/lib/database")
    const product = await getProductBySlugFromDB(slug)
    if (product) return product
  } catch (error) {
    console.error("❌ Veritabanı hatası, fallback veriler kullanılıyor:", error)
  }

  // Fallback: slug'a göre ürün bul
  return fallbackProducts.find((p) => p.slug === slug) || null
}

export async function getProductById(id: string) {
  try {
    const { getProductById: getProductByIdFromDB } = await import("@/lib/database")
    const product = await getProductByIdFromDB(id)

    if (product) {
      // Veritabanından gelen veriyi, detay sayfasında kullanılan formata dönüştür
      return {
        ...product,
        // Eksik alanları ekle veya mevcut alanları dönüştür
        category: product.category_name,
        reviewCount: product.review_count || 0,
        nfcFeatures: product.nfc_features || [],
        // Eğer images dizisi yoksa, primary_image'i kullanarak bir dizi oluştur
        images: product.images || (product.primary_image ? [product.primary_image] : []),
        // Eğer features dizisi yoksa, boş bir dizi oluştur
        features: product.features || [],
        // Eğer specifications nesnesi yoksa, boş bir nesne oluştur
        specifications: product.specifications || {},
        // Diğer gerekli alanlar
        video360: product.video_360 || null,
      }
    }
  } catch (error) {
    console.error("❌ Veritabanı hatası, fallback veriler kullanılıyor:", error)
  }

  // Fallback: id'ye göre ürün bul
  return fallbackProducts.find((p) => p.id === id) || null
}

// getRelatedProducts fonksiyonunu ekleyelim
export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4) {
  try {
    // Veritabanından ilgili ürünleri çekmeye çalış
    const allProducts = await getProducts(100, 0)

    // Aynı kategorideki, ancak farklı ID'ye sahip ürünleri filtrele
    const related = allProducts.filter((p) => p.id !== productId && p.category_slug === categorySlug).slice(0, limit)

    if (related.length > 0) {
      return related.map((product) => ({
        ...product,
        category: product.category_name,
        reviewCount: product.review_count || 0,
        nfcFeatures: product.nfc_features || [],
        images: product.images || (product.primary_image ? [product.primary_image] : []),
        features: product.features || [],
        specifications: product.specifications || {},
        video360: product.video_360 || null,
      }))
    }
  } catch (error) {
    console.error("❌ İlgili ürünleri çekerken hata oluştu, fallback veriler kullanılıyor:", error)
  }

  // Fallback: Aynı kategorideki diğer ürünleri bul
  return fallbackProducts.filter((p) => p.id !== productId && p.categorySlug === categorySlug).slice(0, limit)
}
