import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Share2, Star, Zap, Shield, Truck, RotateCcw, ArrowLeft } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface ProductPageProps {
  params: {
    id: string
  }
}

// Veritabanından ürün çekme fonksiyonu
async function getProductFromAPI(id: string) {
  try {
    console.log("🔍 Ürün detay sayfası - ID:", id)

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

    const url = `${baseUrl}/api/products/${id}`
    console.log("🔍 API URL:", url)

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("🔍 API Response status:", response.status)
    console.log("🔍 API Response ok:", response.ok)

    if (!response.ok) {
      console.log("❌ API response not ok:", response.status, response.statusText)
      const errorText = await response.text()
      console.log("❌ Error response:", errorText)
      return null
    }

    const data = await response.json()
    console.log("✅ API response data:", data)

    if (data.success && data.product) {
      console.log("✅ Product found:", data.product.name)
      return data.product
    }

    console.log("❌ No product in response")
    return null
  } catch (error) {
    console.error("❌ API fetch error:", error)
    return null
  }
}

// Demo ürün verisi (fallback)
function getDemoProduct(id: string) {
  console.log("🔄 Demo ürün aranıyor, ID:", id)

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
    },
  }

  const product = demoProducts[id as keyof typeof demoProducts] || null
  console.log("🔄 Demo ürün sonucu:", product ? product.name : "Bulunamadı")
  return product
}

export default async function ProductPage({ params }: ProductPageProps) {
  console.log("📄 Product page başlatılıyor, params:", params)

  try {
    // Önce API'den dene
    let product = await getProductFromAPI(params.id)

    // API'den bulamazsa demo ürünleri dene
    if (!product) {
      console.log("🔄 API'den bulunamadı, demo ürünler deneniyor...")
      product = getDemoProduct(params.id)
    }

    if (!product) {
      console.log("❌ Hiçbir yerde ürün bulunamadı")
      notFound()
    }

    console.log("✅ Kullanılacak ürün:", product.name)

    // Veritabanı formatını normalize et
    const normalizedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.primary_image || product.image || "/placeholder.svg?height=400&width=400",
      category: product.category_name || product.category || "Genel",
      nfcEnabled: product.nfc_enabled || product.nfcEnabled || false,
      stock: product.stock || 0,
      rating: product.rating || 4.5,
      reviewCount: product.review_count || product.reviewCount || 0,
    }

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Debug bilgisi - sadece development'ta göster */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
            <strong>Debug:</strong> ID: {params.id}, Ürün: {normalizedProduct.name}
          </div>
        )}

        {/* Geri Dön Butonu */}
        <Button variant="outline" className="mb-6" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ürünlere Geri Dön
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Ürün Görseli */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={normalizedProduct.image || "/placeholder.svg"}
              alt={normalizedProduct.name}
              className="w-full h-auto object-cover"
              onError={(e) => {
                console.log("❌ Görsel yüklenemedi:", normalizedProduct.image)
                e.currentTarget.src = "/placeholder.svg?height=400&width=400"
              }}
            />
          </div>

          {/* Ürün Bilgileri */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{normalizedProduct.category}</Badge>
                {normalizedProduct.nfcEnabled && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Zap className="w-3 h-3 mr-1" />
                    NFC Özellikli
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{normalizedProduct.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(normalizedProduct.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {normalizedProduct.rating.toFixed(1)} ({normalizedProduct.reviewCount} değerlendirme)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">₺{normalizedProduct.price.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600">KDV Dahil • Ücretsiz Kargo</p>
              {normalizedProduct.stock > 0 ? (
                <p className="text-sm text-green-600">✅ Stokta ({normalizedProduct.stock} adet)</p>
              ) : (
                <p className="text-sm text-red-600">❌ Stokta yok</p>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{normalizedProduct.description}</p>

            {/* Sepete Ekle */}
            <div className="space-y-4">
              <AddToCartButton
                product={{
                  id: normalizedProduct.id,
                  name: normalizedProduct.name,
                  price: normalizedProduct.price,
                  stock: normalizedProduct.stock,
                  image: normalizedProduct.image,
                }}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Favorilere Ekle
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Paylaş
                </Button>
              </div>
            </div>

            {/* Güvence Bilgileri */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm">2 Yıl Garanti</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Ücretsiz Kargo</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span className="text-sm">14 Gün İade</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm">Hızlı Teslimat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Basit özellikler bölümü */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Ürün Özellikleri</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Yüksek kalite malzeme</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Modern ve şık tasarım</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Dayanıklı yapı</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Kolay kullanım</span>
              </li>
              {normalizedProduct.nfcEnabled && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>NFC teknolojisi</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("❌ Product page genel hatası:", error)

    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" className="mb-6" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ürünlere Geri Dön
          </Link>
        </Button>

        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Ürün Yüklenemedi</h1>
          <p className="text-gray-600 mb-6">Bu ürün şu anda görüntülenemiyor. Lütfen daha sonra tekrar deneyin.</p>
          <p className="text-sm text-gray-500 mb-6">Hata: {error.message}</p>
          <Button asChild>
            <Link href="/products">Ürünlere Geri Dön</Link>
          </Button>
        </div>
      </div>
    )
  }
}
