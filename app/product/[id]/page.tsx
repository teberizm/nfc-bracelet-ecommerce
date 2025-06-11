"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Star,
  Zap,
  Shield,
  Truck,
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle,
  Package,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGallery } from "@/components/product-gallery"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/contexts/cart-context"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { dispatch } = useCart()

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Ürün detay sayfası: Ürün çekiliyor (ID: ${params.id})`)

      // Özel tasarım ürünü kontrolü
      if (params.id === "custom-design") {
        const customProduct: Product = {
          id: "custom-design",
          name: "Kendin Tasarla",
          price: 0,
          image: "/placeholder.svg?height=600&width=600",
          description:
            "Hayalinizdeki tasarımı gerçeğe dönüştürün! Bize görseli gönderin, size özel fiyat teklifi verelim. Tamamen kişiselleştirilmiş NFC bileklik deneyimi yaşayın.",
          nfcEnabled: true,
          stock: 999,
          category: "Özel Tasarım",
          rating: 5,
          reviewCount: 47,
          isCustomDesign: true,
          featured: false,
          images: [
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
          ],
          features: [
            "Tamamen kişiselleştirilmiş tasarım",
            "NFC teknolojisi dahil",
            "Yüksek kaliteli malzemeler",
            "Profesyonel tasarım desteği",
            "Hızlı üretim süreci",
            "Özel ambalaj seçenekleri",
          ],
          specifications: {
            Malzeme: "Müşteri tercihi",
            Boyut: "Özelleştirilebilir",
            "NFC Çipi": "NTAG213/215/216",
            "Su Geçirmezlik": "IP67",
            Garanti: "2 Yıl",
            "Üretim Süresi": "3-5 İş Günü",
          },
          nfcFeatures: [
            "Fotoğraf ve video paylaşımı",
            "Sosyal medya profilleri",
            "İletişim bilgileri",
            "Özel mesajlar",
            "Müzik çalma listeleri",
            "Web sitesi yönlendirmeleri",
          ],
        }
        setProduct(customProduct)
        // İlgili ürünleri çek
        await fetchRelatedProducts("ozel-tasarim")
        return
      }

      // Normal ürün için API çağrısı
      const response = await fetch(`/api/products/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          notFound()
          return
        }
        throw new Error(`API hatası: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Ürün detay sayfası: API'den gelen ürün:", data)

      if (!data) {
        notFound()
        return
      }

      // Ürün verisini normalize et
      const normalizedProduct: Product = {
        id: data.id,
        name: data.name || "",
        price: Number(data.price) || 0,
        originalPrice: data.original_price ? Number(data.original_price) : undefined,
        image: data.primary_image || "/placeholder.svg?height=600&width=600",
        description: data.description || "",
        nfcEnabled: Boolean(data.nfc_enabled),
        stock: Number(data.stock) || 0,
        category: data.category_name || "Genel",
        rating: Number(data.rating) || 4.5,
        reviewCount: Number(data.review_count) || 0,
        featured: Boolean(data.featured),
        images: parseArrayField(data.images) || [data.primary_image || "/placeholder.svg?height=600&width=600"],
        features: parseArrayField(data.features) || [],
        specifications: parseObjectField(data.specifications) || {},
        nfcFeatures: parseArrayField(data.nfc_features) || [],
        video360: data.video_360 || null,
        created_at: data.created_at,
      }

      setProduct(normalizedProduct)
      console.log("Ürün detay sayfası: Ürün başarıyla yüklendi:", normalizedProduct.name)

      // İlgili ürünleri çek
      if (data.category_slug) {
        await fetchRelatedProducts(data.category_slug)
      }
    } catch (error) {
      console.error("Ürün detay sayfası: Ürün yüklenirken hata:", error)
      setError("Ürün bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (categorySlug: string) => {
    try {
      console.log(`İlgili ürünler çekiliyor (kategori: ${categorySlug})`)

      const response = await fetch(`/api/products?category=${categorySlug}&limit=4`)

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          // Mevcut ürünü hariç tut
          const filtered = data.filter((p) => p.id !== params.id).slice(0, 4)
          setRelatedProducts(filtered)
          console.log(`${filtered.length} ilgili ürün yüklendi`)
        }
      }
    } catch (error) {
      console.error("İlgili ürünler yüklenirken hata:", error)
      // İlgili ürünler yüklenemezse sessizce devam et
    }
  }

  // Array field'ları güvenli şekilde parse et
  const parseArrayField = (field: any): string[] | null => {
    try {
      if (!field) return null
      if (Array.isArray(field)) return field.filter((item) => item && typeof item === "string")
      if (typeof field === "string") {
        if (field.startsWith("{") && field.endsWith("}")) {
          const items = field.slice(1, -1).split(",")
          return items.map((item) => item.trim().replace(/^"(.*)"$/, "$1")).filter(Boolean)
        }
        try {
          const parsed = JSON.parse(field)
          return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === "string") : null
        } catch {
          return [field]
        }
      }
      return null
    } catch {
      return null
    }
  }

  // Object field'ları güvenli şekilde parse et
  const parseObjectField = (field: any): Record<string, any> | null => {
    try {
      if (!field) return null
      if (typeof field === "object" && !Array.isArray(field)) return field
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field)
          return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null
        } catch {
          return null
        }
      }
      return null
    } catch {
      return null
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    for (let i = 0; i < quantity; i++) {
      dispatch({ type: "ADD_ITEM", payload: product })
    }
    toast({
      title: "Sepete Eklendi!",
      description: `${quantity} adet ${product.name} sepetinize eklendi.`,
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gray-300"
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2"></div>
              <div className="bg-gray-200 h-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProduct}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-gray-900">
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900">
          Ürünler
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Geri Dön Butonu */}
      <Button variant="outline" className="mb-6" asChild>
        <Link href="/products">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Ürünlere Geri Dön
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Sol Taraf - Ürün Galerisi */}
        <div>
          <ProductGallery
            images={product.images || [product.image]}
            productName={product.name}
            video360={product.video360}
          />
        </div>

        {/* Sağ Taraf - Ürün Bilgileri */}
        <div className="space-y-6">
          {/* Başlık ve Kategori */}
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">{renderStars(product.rating || 4.5)}</div>
              <span className="text-sm text-gray-600">
                {product.rating || 4.5} ({product.reviewCount || 0} değerlendirme)
              </span>
            </div>
          </div>

          {/* Fiyat */}
          <div className="flex items-center gap-4">
            {product.isCustomDesign ? (
              <div>
                <span className="text-2xl font-bold text-blue-600">Özel Fiyat</span>
                <p className="text-sm text-gray-600 mt-1">Tasarımınıza göre fiyat belirlenecektir</p>
              </div>
            ) : (
              <>
                <span className="text-4xl font-bold text-blue-600">₺{product.price.toLocaleString("tr-TR")}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ₺{product.originalPrice.toLocaleString("tr-TR")}
                  </span>
                )}
              </>
            )}
            {product.nfcEnabled && (
              <Badge className="bg-blue-600">
                <Zap className="h-3 w-3 mr-1" />
                NFC Özellikli
              </Badge>
            )}
          </div>

          {/* Açıklama */}
          <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>

          {/* Stok Durumu */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">
                  {product.isCustomDesign ? "Sipariş alınıyor" : `Stokta var (${product.stock} adet)`}
                </span>
              </>
            ) : (
              <span className="text-red-600 font-medium">Stokta yok</span>
            )}
          </div>

          {/* Miktar Seçimi */}
          {product.stock > 0 && !product.isCustomDesign && (
            <div className="flex items-center gap-4">
              <span className="font-medium">Miktar:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="flex gap-4">
            {product.isCustomDesign ? (
              <Button size="lg" className="flex-1" asChild>
                <Link href="/custom-design">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Tasarımını Gönder
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? "Stokta Yok" : "Sepete Ekle"}
              </Button>
            )}
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Güvenlik Bilgileri */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Ücretsiz Kargo</p>
              <p className="text-xs text-gray-600">150₺ üzeri</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Güvenli Ödeme</p>
              <p className="text-xs text-gray-600">SSL korumalı</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">2 Yıl Garanti</p>
              <p className="text-xs text-gray-600">Ücretsiz değişim</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detaylı Bilgiler */}
      <div className="mb-16">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Özellikler</TabsTrigger>
            <TabsTrigger value="specs">Teknik Özellikler</TabsTrigger>
            {product.nfcEnabled && <TabsTrigger value="nfc">NFC Özellikleri</TabsTrigger>}
            <TabsTrigger value="reviews">Değerlendirmeler</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ürün Özellikleri</CardTitle>
              </CardHeader>
              <CardContent>
                {product.features && product.features.length > 0 ? (
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Ürün özellikleri yakında eklenecek...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Teknik Özellikler</CardTitle>
              </CardHeader>
              <CardContent>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Teknik özellikler yakında eklenecek...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {product.nfcEnabled && (
            <TabsContent value="nfc" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    NFC Özellikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                      Bu ürün NFC (Near Field Communication) teknolojisi ile donatılmıştır. Telefonunuzu yaklaştırarak
                      aşağıdaki içerikleri paylaşabilirsiniz:
                    </p>
                    {product.nfcFeatures && product.nfcFeatures.length > 0 ? (
                      <ul className="space-y-3">
                        {product.nfcFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Fotoğraf ve video paylaşımı</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Sosyal medya profilleri</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>İletişim bilgileri</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Özel mesajlar</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Değerlendirmeleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Değerlendirmeler yakında eklenecek...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* İlgili Ürünler */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-8">Benzer Ürünler</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
