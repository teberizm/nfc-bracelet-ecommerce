import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Share2, Star, Zap, Shield, Truck, RotateCcw, ArrowLeft } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ProductGallery } from "@/components/product-gallery"
import { sql } from "@/lib/database"

interface ProductPageProps {
  params: {
    id: string
  }
}

// Veritabanından ürün bilgilerini getiren fonksiyon
async function getProduct(id: string) {
  console.log("Fetching product with ID:", id)

  try {
    // Ürün bilgilerini getir
    const product = await sql`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id} AND p.is_active = true
      LIMIT 1
    `

    if (!product || product.length === 0) {
      console.log("Product not found in database")
      return null
    }

    // Ürün görselleri
    const images = await sql`
      SELECT image_url FROM product_images 
      WHERE product_id = ${id}
      ORDER BY sort_order
    `

    // Ürün özellikleri
    const features = await sql`
      SELECT feature_name FROM product_features
      WHERE product_id = ${id}
      ORDER BY sort_order
    `

    // Ürün teknik özellikleri
    const specs = await sql`
      SELECT spec_name, spec_value FROM product_specifications
      WHERE product_id = ${id}
      ORDER BY sort_order
    `

    // Veriyi düzenle
    const productData = {
      ...product[0],
      images: images.map((img: any) => img.image_url),
      features: features.map((f: any) => f.feature_name),
      specifications: specs.reduce((acc: any, spec: any) => {
        acc[spec.spec_name] = spec.spec_value
        return acc
      }, {}),
    }

    console.log("Product found:", productData.name)
    return productData
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  console.log("Rendering product page for ID:", params.id)

  // Veritabanından ürünü çek
  const product = await getProduct(params.id)

  // Ürün bulunamadıysa 404 sayfası göster
  if (!product) {
    console.log("Product not found, showing 404")
    notFound()
  }

  // İndirim oranı hesapla
  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
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
            images={
              product.images?.length > 0
                ? product.images
                : [product.primary_image || "/placeholder.svg?height=400&width=400"]
            }
            productName={product.name}
            video360={product.video_360_url}
          />
        </div>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category_name}</Badge>
              {product.nfc_enabled && (
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
                {(product.rating || 4.5).toFixed(1)} ({product.review_count || 0} değerlendirme)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">₺{product.price.toLocaleString()}</span>
              {product.original_price && (
                <>
                  <span className="text-xl text-gray-500 line-through">₺{product.original_price.toLocaleString()}</span>
                  <Badge variant="destructive">{discountPercentage}% İndirim</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">KDV Dahil • Ücretsiz Kargo</p>
          </div>

          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* Sepete Ekle */}
          <div className="space-y-4">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock || 10,
                image: product.primary_image || "/placeholder.svg?height=400&width=400",
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
                  {product.features.map((feature: string, index: number) => (
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
    </div>
  )
}
