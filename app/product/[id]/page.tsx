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
async function getProductFromDatabase(id: string) {
  try {
    console.log("🔍 Veritabanından ürün çekiliyor, ID:", id)

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.log("❌ API response not ok:", response.status)
      return null
    }

    const data = await response.json()
    console.log("✅ API response:", data)

    if (data.success && data.product) {
      return data.product
    }

    return null
  } catch (error) {
    console.error("❌ Veritabanı hatası:", error)
    return null
  }
}

// Demo ürün verisi (fallback)
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

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    console.log("📄 Product page loading, ID:", params.id)

    // Önce veritabanından dene
    let product = await getProductFromDatabase(params.id)

    // Veritabanından bulamazsa demo ürünleri dene
    if (!product) {
      console.log("🔄 Veritabanında bulunamadı, demo ürünler deneniyor...")
      product = getDemoProduct(params.id)
    }

    if (!product) {
      console.log("❌ Ürün hiçbir yerde bulunamadı")
      notFound()
    }

    console.log("✅ Ürün bulundu:", product.name)

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
      features: product.features || [
        "Yüksek kalite malzeme",
        "Modern tasarım",
        "Dayanıklı yapı",
        "Kolay kullanım",
        "Garanti kapsamında",
      ],
      specifications: product.specifications || {
        Malzeme: "Yüksek Kalite",
        Renk: "Çeşitli",
        Boyut: "Standart",
        Garanti: "2 Yıl",
      },
    }

    return (
      <div className="container mx-auto px-4 py-8">
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

        {/* Özellikler */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Özellikler</h3>
              <ul className="space-y-2">
                {normalizedProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Teknik Özellikler</h3>
              <div className="space-y-2">
                {Object.entries(normalizedProduct.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("❌ Product page error:", error)

    // Hata durumunda basit bir sayfa göster
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
          <Button asChild>
            <Link href="/products">Ürünlere Geri Dön</Link>
          </Button>
        </div>
      </div>
    )
  }
}
