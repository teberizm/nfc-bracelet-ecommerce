import {
  getAllProducts as getProductsFromDB,
  getProductById as getProductByIdFromDB,
  getProductBySlug as getProductBySlugFromDB,
} from "@/lib/database"

export async function getProducts(limit = 50, offset = 0) {
  try {
    console.log("Veritabanından ürünler çekiliyor...")
    const products = await getProductsFromDB(limit, offset)
    console.log(`✅ ${products.length} ürün başarıyla çekildi`)
    return products.map((product) => normalizeProduct(product))
  } catch (error) {
    console.error("❌ Veritabanından ürünler çekilirken hata:", error)
    throw error
  }
}

export async function getProductBySlug(slug: string) {
  try {
    console.log(`Ürün slug ile çekiliyor: ${slug}`)
    const product = await getProductBySlugFromDB(slug)

    if (!product) {
      console.log(`❌ Ürün bulunamadı: ${slug}`)
      return null
    }

    console.log(`✅ Ürün başarıyla çekildi:`, product.name)
    return normalizeProduct(product)
  } catch (error) {
    console.error(`❌ Ürün çekilirken hata (slug: ${slug}):`, error)
    throw error
  }
}

export async function getProductById(id: string) {
  try {
    console.log(`Ürün ID ile çekiliyor: ${id}`)
    const product = await getProductByIdFromDB(id)

    if (!product) {
      console.log(`❌ Ürün bulunamadı: ${id}`)
      return null
    }

    console.log(`✅ Ürün başarıyla çekildi:`, product.name)
    console.log(`Ürün verisi:`, JSON.stringify(product, null, 2))

    return normalizeProduct(product)
  } catch (error) {
    console.error(`❌ Ürün çekilirken hata (id: ${id}):`, error)
    throw error
  }
}

// Veritabanından gelen ürün verisini normalize et
function normalizeProduct(product: any) {
  try {
    console.log("Ürün normalize ediliyor:", product.name)
    console.log("Ham ürün verisi:", product)

    // Resim verilerini parse et
    let images = []
    let primaryImage = "/placeholder.svg?height=300&width=300"

    // Eğer product_images varsa (JOIN ile gelen veri)
    if (product.product_images && Array.isArray(product.product_images)) {
      images = product.product_images.filter((img) => img && img.image_url).map((img) => img.image_url)

      // Ana resmi bul
      const primaryImg = product.product_images.find((img) => img.is_primary)
      if (primaryImg) {
        primaryImage = primaryImg.image_url
      } else if (images.length > 0) {
        primaryImage = images[0]
      }
    }
    // Eğer images field'ı varsa (JSON olarak)
    else if (product.images) {
      const parsedImages = parseArrayField(product.images)
      if (parsedImages && parsedImages.length > 0) {
        images = parsedImages
        primaryImage = parsedImages[0]
      }
    }
    // primary_image field'ı varsa
    else if (product.primary_image) {
      primaryImage = product.primary_image
      images = [product.primary_image]
    }

    console.log("Parse edilen resimler:", images)
    console.log("Ana resim:", primaryImage)

    const normalized = {
      id: product.id,
      name: product.name || "",
      slug: product.slug || "",
      price: Number(product.price) || 0,
      originalPrice: product.original_price ? Number(product.original_price) : null,
      image: primaryImage, // Ana resim
      primary_image: primaryImage,
      description: product.description || "",
      nfc_enabled: Boolean(product.nfc_enabled),
      nfcEnabled: Boolean(product.nfc_enabled),
      stock: Number(product.stock) || 0,
      featured: Boolean(product.featured),
      category_name: product.category_name || "Genel",
      category: product.category_name || "Genel",
      categorySlug: product.category_slug || "genel",
      rating: Number(product.rating) || 4.5,
      reviewCount: Number(product.review_count) || 0,
      review_count: Number(product.review_count) || 0,
      created_at: product.created_at,

      // Resim dizisi
      images: images.length > 0 ? images : [primaryImage],

      // Diğer alanlar
      features: parseArrayField(product.features) || [],
      nfcFeatures: parseArrayField(product.nfc_features) || [],
      specifications: parseObjectField(product.specifications) || {},

      // Video 360
      video360: product.video_360 || product.video360 || null,
    }

    console.log("✅ Ürün normalize edildi:", normalized.name)
    console.log("Final resimler:", normalized.images)
    console.log("Final ana resim:", normalized.image)

    return normalized
  } catch (error) {
    console.error("❌ Ürün normalize edilirken hata:", error)
    throw error
  }
}

// Array field'ları güvenli şekilde parse et
function parseArrayField(field: any): string[] | null {
  try {
    if (!field) return null

    // Eğer zaten array ise
    if (Array.isArray(field)) {
      return field.filter((item) => item && typeof item === "string")
    }

    // Eğer string ise JSON parse et
    if (typeof field === "string") {
      // PostgreSQL array formatı {item1,item2} şeklinde olabilir
      if (field.startsWith("{") && field.endsWith("}")) {
        const items = field.slice(1, -1).split(",")
        return items.map((item) => item.trim().replace(/^"(.*)"$/, "$1")).filter(Boolean)
      }

      // JSON array formatı
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === "string") : null
      } catch {
        return [field]
      }
    }

    return null
  } catch (error) {
    console.error("Array field parse hatası:", error)
    return null
  }
}

// Object field'ları güvenli şekilde parse et
function parseObjectField(field: any): Record<string, any> | null {
  try {
    if (!field) return null

    // Eğer zaten object ise
    if (typeof field === "object" && !Array.isArray(field)) {
      return field
    }

    // Eğer string ise JSON parse et
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field)
        return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null
      } catch {
        return null
      }
    }

    return null
  } catch (error) {
    console.error("Object field parse hatası:", error)
    return null
  }
}

// İlgili ürünleri getir
export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4) {
  try {
    console.log(`İlgili ürünler çekiliyor. ProductId: ${productId}, CategorySlug: ${categorySlug}`)

    // Aynı kategorideki diğer ürünleri çek
    const allProducts = await getProducts(100, 0)

    // Aynı kategorideki, ancak farklı ID'ye sahip ürünleri filtrele
    const related = allProducts
      .filter((p) => p.id !== productId && (p.category_slug === categorySlug || p.categorySlug === categorySlug))
      .slice(0, limit)

    console.log(`✅ ${related.length} ilgili ürün bulundu`)

    return related
  } catch (error) {
    console.error("❌ İlgili ürünler çekilirken hata:", error)
    // İlgili ürünler çekilemezse boş array döndür, hata fırlatma
    return []
  }
}
