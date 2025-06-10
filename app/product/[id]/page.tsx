"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGallery } from "@/components/product-gallery"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"
import { getProductById, getRelatedProducts } from "@/lib/products"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1)
  const { dispatch } = useCart()

  const product = getProductById(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product.id, product.category)

  const handleAddToCart = () => {
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
          <ProductGallery images={product.images} productName={product.name} video360={product.video360} />
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
              <div className="flex items-center">{renderStars(product.rating)}</div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviewCount} değerlendirme)
              </span>
            </div>
          </div>

          {/* Fiyat */}
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-blue-600">₺{product.price.toLocaleString("tr-TR")}</span>
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
                <span className="text-green-600 font-medium">Stokta var ({product.stock} adet)</span>
              </>
            ) : (
              <span className="text-red-600 font-medium">Stokta yok</span>
            )}
          </div>

          {/* Miktar Seçimi */}
          {product.stock > 0 && (
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
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock === 0 ? "Stokta Yok" : "Sepete Ekle"}
            </Button>
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
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Teknik Özellikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {product.nfcEnabled && product.nfcFeatures && (
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
                    <ul className="space-y-3">
                      {product.nfcFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
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
