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

// Demo ürün verisi
function getDemoProduct(id: string) {
  const demoProducts = {
    "1": {
      id: "1",
      name: "NFC Bileklik Premium",
      description: "Yüksek kaliteli NFC özellikli bileklik. Su geçirmez ve dayanıklı malzemeden üretilmiştir.",
      price: 299.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Bileklikler",
      nfc_enabled: true,
      stock: 10,
      rating: 4.5,
      review_count: 12,
      features: ["Su geçirmez tasarım", "Uzun pil ömrü", "Şık ve modern görünüm", "Kolay kullanım"],
      specifications: {
        Malzeme: "Silikon",
        Renk: "Siyah",
        Boyut: "Ayarlanabilir",
        "NFC Tipi": "NTAG213",
      },
    },
    "2": {
      id: "2",
      name: "NFC Kolye",
      description: "Şık tasarımlı NFC özellikli kolye. Paslanmaz çelik malzemeden üretilmiştir.",
      price: 349.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Kolyeler",
      nfc_enabled: true,
      stock: 8,
      rating: 4.7,
      review_count: 9,
      features: ["Paslanmaz çelik", "Şık tasarım", "Uzun zincir", "Tüm telefonlarla uyumlu"],
      specifications: {
        Malzeme: "Paslanmaz Çelik",
        Renk: "Gümüş",
        "Zincir Uzunluğu": "50cm",
      },
    },
    "3": {
      id: "3",
      name: "NFC Yüzük",
      description: "Modern tasarımlı NFC özellikli yüzük. Seramik malzemeden üretilmiştir.",
      price: 399.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Yüzükler",
      nfc_enabled: true,
      stock: 5,
      rating: 4.3,
      review_count: 6,
      features: ["Seramik malzeme", "Şık tasarım", "Farklı boyutlar", "Çizilmeye dayanıklı"],
      specifications: {
        Malzeme: "Seramik",
        Renk: "Siyah",
        Boyutlar: "16-22mm",
      },
    },
    "4": {
      id: "4",
      name: "Özel Tasarım NFC Takı",
      description: "Kişiselleştirilmiş NFC takı seçenekleri. İstediğiniz tasarımı seçebilirsiniz.",
      price: 499.99,
      image: "/placeholder.svg?height=400&width=400",
      category: "Özel Tasarım",
      nfc_enabled: true,
      stock: 0,
      isCustomDesign: true,
      rating: 4.9,
      review_count: 15,
      features: ["Tamamen kişiselleştirilebilir", "Yüksek kalite malzemeler", "Özel tasarım seçenekleri"],
      specifications: {
        Malzeme: "Çeşitli",
        Renk: "Seçilebilir",
        Boyut: "Özelleştirilebilir",
      },
    },
  }

  return demoProducts[id as keyof typeof demoProducts] || null
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getDemoProduct(params.id)

  if (!product) {
    notFound()
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
          <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-auto object-cover" />
        </div>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
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
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.review_count} değerlendirme)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">₺{product.price.toLocaleString()}</span>
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
                stock: product.stock,
                image: product.image,
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
              {product.features.map((feature, index) => (
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
              {Object.entries(product.specifications).map(([key, value]) => (
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
}
