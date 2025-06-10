import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/products"
import { ProductGallery } from "@/components/product-gallery"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Share2, Star, Zap, Shield, Truck, RotateCcw, ArrowLeft } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import Link from "next/link"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  console.log("Product ID from params:", params.id)

  // Veritabanından ürünü çek
  const product = await getProductById(params.id)
  console.log("Found product:", product)

  if (!product) {
    console.log("Product not found, showing 404")
    notFound()
  }

  // İlgili ürünleri çek
  const relatedProducts = await getRelatedProducts(product.id, product.category, 4)

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
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
        <div>
          <ProductGallery
            images={product.images || [product.image || "/placeholder.svg?height=400&width=400"]}
            productName={product.name}
            video360={product.video360}
          />
        </div>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.nfcEnabled && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Zap className="w-3 h-3 mr-1" />
                  NFC Özellikli
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 4.5) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {(product.rating || 4.5).toFixed(1)} ({product.reviewCount || 0} değerlendirme)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">₺{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">₺{product.originalPrice.toLocaleString()}</span>
                  <Badge variant="destructive">{discountPercentage}% İndirim</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">KDV Dahil • Ücretsiz Kargo</p>
          </div>

          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* NFC Özellikleri */}
          {product.nfcEnabled && product.nfcFeatures && product.nfcFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  NFC Özellikleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.nfcFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sepete Ekle */}
          <div className="space-y-4">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock || 10,
                images: product.images || [product.image || "/placeholder.svg?height=400&width=400"],
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
              {product.features && product.features.length > 0 ? (
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Bu ürün için özellik bilgisi bulunmamaktadır.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Bu ürün için teknik özellik bilgisi bulunmamaktadır.</p>
              )}
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

      {/* İlgili Ürünler */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">İlgili Ürünler</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
