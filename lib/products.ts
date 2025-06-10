import { getAllProducts as getProductsFromDB } from "@/lib/database"

// Fallback ürün verisi
const fallbackProducts = [
  {
    id: "1",
    name: "Premium NFC Deri Bileklik",
    slug: "premium-nfc-deri-bileklik",
    price: 299,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Gerçek deri ve premium NFC teknolojisi ile özel anılarınızı paylaşın.",
    nfc_enabled: true,
    stock: 15,
    featured: true,
    category_name: "Deri Bileklik",
    rating: 4.8,
    review_count: 24,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Spor NFC Silikon Bileklik",
    slug: "spor-nfc-silikon-bileklik",
    price: 199,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Su geçirmez silikon malzeme ile aktif yaşam tarzınıza uygun.",
    nfc_enabled: true,
    stock: 8,
    featured: false,
    category_name: "Silikon Bileklik",
    rating: 4.6,
    review_count: 18,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Lüks NFC Metal Bileklik",
    slug: "luks-nfc-metal-bileklik",
    price: 499,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Paslanmaz çelik ve şık tasarım ile özel günleriniz için.",
    nfc_enabled: true,
    stock: 3,
    featured: true,
    category_name: "Metal Bileklik",
    rating: 4.9,
    review_count: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Klasik NFC Deri Bileklik",
    slug: "klasik-nfc-deri-bileklik",
    price: 249,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Zamansız tasarım ve dayanıklı deri malzeme.",
    nfc_enabled: true,
    stock: 12,
    featured: false,
    category_name: "Deri Bileklik",
    rating: 4.7,
    review_count: 31,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Renkli NFC Silikon Bileklik",
    slug: "renkli-nfc-silikon-bileklik",
    price: 179,
    primary_image: "/placeholder.svg?height=300&width=300",
    description: "Çeşitli renk seçenekleri ile kişisel tarzınızı yansıtın.",
    nfc_enabled: true,
    stock: 25,
    featured: false,
    category_name: "Silikon Bileklik",
    rating: 4.5,
    review_count: 45,
    created_at: new Date().toISOString(),
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
    if (product) return product
  } catch (error) {
    console.error("❌ Veritabanı hatası, fallback veriler kullanılıyor:", error)
  }

  // Fallback: id'ye göre ürün bul
  return fallbackProducts.find((p) => p.id === id) || null
}
