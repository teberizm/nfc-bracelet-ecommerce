import { getAllProducts, getProductBySlug, getProductsByCategory, getCategoryBySlug } from "./database"

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  category: string
  categorySlug: string
  stock: number
  rating: number
  reviewCount: number
  images: string[]
  features: string[]
  specifications: Record<string, string>
  nfcEnabled: boolean
  nfcFeatures?: string[]
  video360?: string
  featured: boolean
  isActive: boolean
  createdAt: string
}

// Tüm ürünleri getir - SADECE VERİTABANINDAN
export async function getProducts(limit = 50, offset = 0): Promise<Product[]> {
  try {
    const products = await getAllProducts(limit, offset)
    return products.map(formatProduct)
  } catch (error) {
    console.error("Ürünler yüklenirken hata:", error)
    return []
  }
}

// Slug ile ürün getir - SADECE VERİTABANINDAN
export async function getProductById(slug: string): Promise<Product | null> {
  try {
    const product = await getProductBySlug(slug)
    return product ? formatProduct(product) : null
  } catch (error) {
    console.error("Ürün yüklenirken hata:", error)
    return null
  }
}

// Kategoriye göre ürünleri getir - SADECE VERİTABANINDAN
export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4): Promise<Product[]> {
  try {
    const category = await getCategoryBySlug(categorySlug)
    if (!category) return []

    const products = await getProductsByCategory(category.id, limit + 1, 0)
    return products
      .filter((p: any) => p.id !== productId)
      .slice(0, limit)
      .map(formatProduct)
  } catch (error) {
    console.error("İlgili ürünler yüklenirken hata:", error)
    return []
  }
}

// Veritabanı formatını frontend formatına çevir
function formatProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    price: Number.parseFloat(dbProduct.price),
    originalPrice: dbProduct.original_price ? Number.parseFloat(dbProduct.original_price) : undefined,
    category: dbProduct.category_name || dbProduct.category,
    categorySlug: dbProduct.category_slug || dbProduct.category,
    stock: dbProduct.stock || 0,
    rating: Number.parseFloat(dbProduct.rating) || 0,
    reviewCount: dbProduct.review_count || 0,
    images: Array.isArray(dbProduct.images)
      ? dbProduct.images.filter(Boolean)
      : [dbProduct.primary_image || "/placeholder.svg?height=400&width=400"],
    features: Array.isArray(dbProduct.features) ? dbProduct.features.filter(Boolean) : [],
    specifications: dbProduct.specifications || {},
    nfcEnabled: dbProduct.nfc_enabled || false,
    nfcFeatures: dbProduct.nfc_features || [],
    video360: dbProduct.video_360_url,
    featured: dbProduct.featured || false,
    isActive: dbProduct.is_active !== false,
    createdAt: dbProduct.created_at,
  }
}

// Arama fonksiyonu - SADECE VERİTABANINDAN
export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  try {
    const products = await getAllProducts(limit, 0)
    return products
      .filter(
        (p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      )
      .map(formatProduct)
  } catch (error) {
    console.error("Ürün arama hatası:", error)
    return []
  }
}

// Statik products array'ini kaldır - artık kullanılmayacak
// export const products = [...] // KALDIRILDI
