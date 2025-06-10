"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, Truck, HeartHandshake, Star, Heart, Quote } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/contexts/cart-context"

// Müşteri yorumları
const customerReviews = [
  {
    id: 1,
    name: "Ayşe & Mehmet",
    relationship: "Sevgililer",
    rating: 5,
    comment:
      "1. yıl dönümümüzde aldığımız NFC bileklikler sayesinde ilk buluşmamızın fotoğraflarını ve videolarını hep yanımızda taşıyoruz. Çok romantik! ❤️",
    product: "Premium NFC Deri Bileklik",
    date: "2 hafta önce",
  },
  {
    id: 2,
    name: "Zeynep & Can",
    relationship: "Nişanlılar",
    rating: 5,
    comment:
      "Nişan fotoğraflarımızı ve o günkü duygularımızı yazdığımız mektubu bilekliğe yükledik. Artık her dokunduğumuzda o anı yeniden yaşıyoruz. Muhteşem bir fikir!",
    product: "Lüks NFC Metal Bileklik",
    date: "1 ay önce",
  },
  {
    id: 3,
    name: "Elif & Burak",
    relationship: "Evli Çift",
    rating: 5,
    comment:
      "Evlilik yıldönümümüzde birbirimize aldık. İçine düğün videomuzun en güzel anlarını koyduk. Çocuklarımız da çok beğendi, onlara da alacağız! 💕",
    product: "Premium NFC Deri Bileklik",
    date: "3 hafta önce",
  },
  {
    id: 4,
    name: "Selin & Emre",
    relationship: "Sevgililer",
    rating: 5,
    comment:
      "Uzaktan ilişki yaşıyoruz. Bu bileklikler sayesinde birbirimize gönderdiğimiz sesli mesajları ve fotoğrafları hep yanımızda taşıyoruz. Sanki hep birlikteyiz! 🥰",
    product: "Spor NFC Silikon Bileklik",
    date: "1 hafta önce",
  },
  {
    id: 5,
    name: "Merve & Oğuz",
    relationship: "Sevgililer",
    rating: 5,
    comment:
      "İlk öpüşmemizin fotoğrafını ve o günkü playlist'imizi yükledik. Arkadaşlarımız çok kıskandı, hepsine tavsiye ettik! Teknoloji ve aşkın mükemmel birleşimi.",
    product: "Premium NFC Deri Bileklik",
    date: "5 gün önce",
  },
  {
    id: 6,
    name: "Gamze & Kaan",
    relationship: "Nişanlılar",
    rating: 5,
    comment:
      "Evlenme teklifinin videosunu ve o gün çektiğimiz fotoğrafları koyduk. Her baktığımızda o mutluluğu yeniden hissediyoruz. Harika bir hatıra! 💍",
    product: "Lüks NFC Metal Bileklik",
    date: "2 ay önce",
  },
  {
    id: 7,
    name: "Deniz & Arda",
    relationship: "Sevgililer",
    rating: 5,
    comment:
      "6 aylık ilişkimizin en güzel anlarını derleyip bir video yaptık ve bilekliğe yükledik. Artık her yerimizde bu özel anılarımız var. Çok duygusal! 😍",
    product: "Spor NFC Silikon Bileklik",
    date: "1 ay önce",
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?limit=20")
        if (response.ok) {
          const products = await response.json()

          // Kendin Tasarla ürününü ekle
          const customDesignProduct: Product = {
            id: "custom-design",
            name: "Kendin Tasarla",
            price: 0,
            image: "/placeholder.svg?height=300&width=300",
            description:
              "Hayalinizdeki tasarımı gerçeğe dönüştürün! Bize görseli gönderin, size özel fiyat teklifi verelim.",
            nfcEnabled: true,
            stock: 999,
            category: "Özel Tasarım",
            rating: 5,
            isCustomDesign: true,
            featured: true,
          }

          // Öne çıkan ürünleri filtrele ve kendin tasarla'yı başa ekle
          const featured = products.filter((p: Product) => p.featured).slice(0, 3)
          setFeaturedProducts([customDesignProduct, ...featured])
        }
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error)
        // Fallback ürünler
        const fallbackProducts: Product[] = [
          {
            id: "custom-design",
            name: "Kendin Tasarla",
            price: 0,
            image: "/placeholder.svg?height=300&width=300",
            description:
              "Hayalinizdeki tasarımı gerçeğe dönüştürün! Bize görseli gönderin, size özel fiyat teklifi verelim.",
            nfcEnabled: true,
            stock: 999,
            category: "Özel Tasarım",
            rating: 5,
            isCustomDesign: true,
            featured: true,
          },
          {
            id: "1",
            name: "Premium NFC Deri Bileklik",
            price: 299,
            image: "/placeholder.svg?height=300&width=300",
            description: "Gerçek deri ve premium NFC teknolojisi ile özel anılarınızı paylaşın.",
            nfcEnabled: true,
            stock: 15,
            featured: true,
          },
          {
            id: "2",
            name: "Spor NFC Silikon Bileklik",
            price: 199,
            image: "/placeholder.svg?height=300&width=300",
            description: "Su geçirmez silikon malzeme ile aktif yaşam tarzınıza uygun.",
            nfcEnabled: true,
            stock: 8,
            featured: true,
          },
          {
            id: "3",
            name: "Lüks NFC Metal Bileklik",
            price: 499,
            image: "/placeholder.svg?height=300&width=300",
            description: "Paslanmaz çelik ve şık tasarım ile özel günleriniz için.",
            nfcEnabled: true,
            stock: 3,
            featured: true,
          },
        ]
        setFeaturedProducts(fallbackProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Zap className="h-4 w-4 mr-2" />
            NFC Teknolojisi
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Anılarınızı Teknoloji ile Buluşturun</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            NFC teknolojisi ile donatılmış özel bilekliklerimiz sayesinde sevdiklerinizle fotoğraflarınızı,
            videolarınızı ve mesajlarınızı anında paylaşın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/products">Ürünleri İncele</Link>
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
              asChild
            >
              <Link href="/how-it-works">
                <Zap className="h-5 w-5 mr-2" />
                Nasıl Çalışır?
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Neden NFC Bileklik?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Anında Paylaşım</h3>
              <p className="text-gray-600">
                Telefonunuzu yaklaştırın, anılarınız anında paylaşılsın. Uygulama indirmeye gerek yok!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Güvenli & Özel</h3>
              <p className="text-gray-600">
                Verileriniz güvenli sunucularımızda saklanır. Sadece siz kontrol edersiniz.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kişiselleştirilebilir</h3>
              <p className="text-gray-600">İstediğiniz tema ve içeriklerle bilekliğinizi tamamen kişiselleştirin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Öne Çıkan Ürünler</h2>
            <Button variant="outline" asChild>
              <Link href="/products">Tümünü Gör</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın!</h2>
          <p className="text-xl mb-8 text-blue-100">
            İlk NFC bilekliğinizi sipariş edin ve teknolojinin gücünü keşfedin.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Truck className="h-5 w-5 mr-2" />
            Ücretsiz Kargo ile Sipariş Ver
          </Button>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-100 text-red-600 border-red-200">
              <Heart className="h-4 w-4 mr-2" />
              Sevgili Yorumları
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Aşkın Teknoloji ile Buluştuğu Anlar</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Binlerce çiftin özel anlarını paylaştığı NFC bilekliklerimiz ile yaşadıkları muhteşem deneyimler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300 border-pink-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-pink-600 font-medium">{review.relationship}</p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <Quote className="h-6 w-6 text-pink-300 absolute -top-2 -left-1" />
                    <p className="text-gray-700 italic pl-6 leading-relaxed">{review.comment}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium text-blue-600">{review.product}</span>
                    <span>{review.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600"
              asChild
            >
              <Link href="/products">
                <Heart className="h-5 w-5 mr-2" />
                Siz de Aşkınızı Paylaşın
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
