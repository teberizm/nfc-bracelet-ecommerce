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

// Demo ürün verisi (veritabanı hatası durumunda)
function getDemoProduct(id: string) {
  const demoProducts = {
    "1": {
      id: "1",
      name: "Premium NFC Deri Bileklik",
      description: "Gerçek deri ve premium NFC teknolojisi ile özel anılarınızı paylaşın.",
      price: 299,
      image: "/placeholder.svg?height=400&width=400",
      category: "Deri Bileklik",
      nfcEnabled: true,
      stock: 15,
      rating: 4.8,
      reviewCount: 24,
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
      image: "/placeholder.svg?height=400&width=400",
      category: "Silikon Bileklik",
      nfcEnabled: true,
      stock: 8,
      rating: 4.6,
      reviewCount: 18,
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
      image: "/placeholder.svg?height=400&width=400",
      category: "Metal Bileklik",
      nfcEnabled: true,
      stock: 3,
      rating: 4.9,
      reviewCount: 12,
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
      image: "/placeholder.svg?height=400&width=400",
      category: "Deri Bileklik",
      nfcEnabled: true,
      stock: 12,
      rating: 4.7,
      reviewCount: 31,
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
    console.log("Product ID from params:", params.id)

    // Önce demo ürünü dene
    const demoProduct = getDemoProduct(params.id)

    if (!demoProduct) {
      console.log("Demo product not found for ID:", params.id)
      notFound()
    }

    console.log("Using demo product:", demoProduct.name)

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
              src={demoProduct.image || "/placeholder.svg?height=400&width=400"}
              alt={demoProduct.name}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Ürün Bilgileri */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{demoProduct.category}</Badge>
                {demoProduct.nfcEnabled && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Zap className="w-3 h-3 mr-1" />
                    NFC Özellikli
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{demoProduct.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(demoProduct.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {demoProduct.rating.toFixed(1)} ({demoProduct.reviewCount} değerlendirme)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">₺{demoProduct.price.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600">KDV Dahil • Ücretsiz Kargo</p>
            </div>

            <p className="text-gray-700 leading-relaxed">{demoProduct.description}</p>

            {/* Sepete Ekle */}
            <div className="space-y-4">
              <AddToCartButton
                product={{
                  id: demoProduct.id,
                  name: demoProduct.name,
                  price: demoProduct.price,
                  stock: demoProduct.stock,
                  image: demoProduct.image,
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
                {demoProduct.features.map((feature, index) => (
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
                {Object.entries(demoProduct.specifications).map(([key, value]) => (
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
    console.error("Error in ProductPage:", error)

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
