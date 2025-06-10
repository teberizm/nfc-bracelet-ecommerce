import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Share2,
  Star,
  Zap,
  Shield,
  Truck,
  RotateCcw,
  ArrowLeft,
  Check,
  Info,
  ShoppingBag,
  Clock,
} from "lucide-react"
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

export default async function ProductPage({ params }: ProductPageProps) {
  console.log("📄 Product page başlatılıyor, params:", params)

  try {
    // API'den ürünü çek
    const product = await getProductFromAPI(params.id)

    if (!product) {
      console.log("❌ Ürün bulunamadı")
      return (
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" className="mb-6" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ürünlere Geri Dön
            </Link>
          </Button>

          <div className="text-center py-16">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h1>
            <p className="text-gray-600 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
            <div className="space-y-4">
              <Button asChild>
                <Link href="/products">Tüm Ürünleri Görüntüle</Link>
              </Button>
              <div>
                <Button variant="outline" asChild>
                  <Link href="/">Ana Sayfaya Dön</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    console.log("✅ Kullanılacak ürün:", product.name)

    // Veritabanı formatını normalize et
    const normalizedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || "Bu ürün için henüz detaylı açıklama bulunmamaktadır.",
      price: product.price || 0,
      originalPrice: product.original_price || product.originalPrice,
      image: product.primary_image || product.image || "/placeholder.svg?height=400&width=400",
      images: product.images || [product.primary_image || product.image || "/placeholder.svg?height=400&width=400"],
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
      isCustomDesign: product.id === "custom-design" || product.isCustomDesign,
    }

    // İndirim hesapla
    const discountPercentage = normalizedProduct.originalPrice
      ? Math.round(
          ((normalizedProduct.originalPrice - normalizedProduct.price) / normalizedProduct.originalPrice) * 100,
        )
      : 0

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
          {/* Ürün Görselleri */}
          <div className="space-y-4">
            {/* Ana Görsel */}
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
              <img
                src={normalizedProduct.image || "/placeholder.svg"}
                alt={normalizedProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log("❌ Görsel yüklenemedi:", normalizedProduct.image)
                  e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                }}
              />
            </div>

            {/* Küçük Görseller */}
            {normalizedProduct.images && normalizedProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {normalizedProduct.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${normalizedProduct.name} - Görsel ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
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
                {normalizedProduct.stock <= 5 && normalizedProduct.stock > 0 && (
                  <Badge variant="destructive">Son {normalizedProduct.stock} Ürün</Badge>
                )}
                {normalizedProduct.isCustomDesign && (
                  <Badge className="bg-purple-100 text-purple-800">Özel Tasarım</Badge>
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
                {normalizedProduct.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₺{normalizedProduct.originalPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive">{discountPercentage}% İndirim</Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">KDV Dahil • Ücretsiz Kargo</p>
              {normalizedProduct.stock > 0 ? (
                <p className="text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Stokta ({normalizedProduct.stock} adet)
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center">
                  <Info className="w-4 h-4 mr-1" /> Stokta yok
                </p>
              )}
            </div>

            <div className="border-t border-b py-4">
              <p className="text-gray-700 leading-relaxed">{normalizedProduct.description}</p>
            </div>

            {/* Sepete Ekle */}
            <div className="space-y-4">
              {normalizedProduct.isCustomDesign ? (
                <Button className="w-full h-12 text-lg" asChild>
                  <Link href="/custom-design">
                    <Zap className="w-5 h-5 mr-2" />
                    Tasarlamaya Başla
                  </Link>
                </Button>
              ) : (
                <AddToCartButton
                  product={{
                    id: normalizedProduct.id,
                    name: normalizedProduct.name,
                    price: normalizedProduct.price,
                    stock: normalizedProduct.stock,
                    image: normalizedProduct.image,
                  }}
                  className="w-full h-12 text-lg"
                />
              )}
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

            {/* Teslimat Bilgileri */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Ücretsiz Kargo</p>
                  <p className="text-sm text-gray-600">1-3 iş günü içinde kargoya verilir</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Kolay İade</p>
                  <p className="text-sm text-gray-600">14 gün içinde ücretsiz iade</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Hızlı Teslimat</p>
                  <p className="text-sm text-gray-600">Aynı gün kargo seçeneği</p>
                </div>
              </div>
            </div>

            {/* Güvence Bilgileri */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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

        {/* Detaylı Bilgiler */}
        <Tabs defaultValue="features" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Özellikler</TabsTrigger>
            <TabsTrigger value="specifications">Teknik Özellikler</TabsTrigger>
            <TabsTrigger value="reviews">Değerlendirmeler</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {normalizedProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {Object.entries(normalizedProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz değerlendirme yok</h3>
                  <p className="text-gray-600">Bu ürün için ilk değerlendirmeyi siz yapın!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Benzer Ürünler */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={`/placeholder.svg?height=200&width=200&query=nfc+bracelet+${i}`}
                    alt="Benzer Ürün"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-1">NFC Bileklik Model {i}</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">₺{(199 + i * 50).toLocaleString()}</span>
                    <Badge variant="outline" className="text-xs">
                      Yeni
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
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
