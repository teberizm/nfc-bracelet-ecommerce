import { getProducts } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Zap, Shield, Truck, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  // Veritabanından ürünleri çek
  const allProducts = await getProducts(20, 0)
  const featuredProducts = allProducts.filter((product) => product.featured).slice(0, 4)
  const newProducts = allProducts.slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              <Zap className="w-4 h-4 mr-2" />
              NFC Teknolojisi ile Güçlendirilmiş
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Sevginizi Dijital Dünyaya Taşıyın
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              NFC teknolojisi ile donatılmış özel takılarımızla, sevdiklerinizle anılarınızı paylaşın. Bir dokunuşla
              fotoğraf, video ve mesajlarınızı aktarın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-blue-50">
                <Heart className="w-5 h-5 mr-2" />
                Koleksiyonu Keşfet
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Nasıl Çalışır?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Ürünler */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Öne Çıkan Ürünler</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                En popüler NFC takılarımızı keşfedin ve sevdiklerinizle özel anlarınızı paylaşın.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/products">
                <Button size="lg" variant="outline">
                  Tüm Ürünleri Gör
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Özellikler */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Neden Bizi Seçmelisiniz?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              NFC teknolojisi ile donatılmış takılarımızın sunduğu benzersiz avantajları keşfedin.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">NFC Teknolojisi</h3>
                <p className="text-gray-600">Bir dokunuşla anılarınızı paylaşın</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Kişisel Tasarım</h3>
                <p className="text-gray-600">Size özel tasarımlar oluşturun</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Güvenli & Dayanıklı</h3>
                <p className="text-gray-600">Yüksek kalite malzemeler</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Truck className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
                <p className="text-gray-600">Türkiye geneli ücretsiz kargo</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Yeni Ürünler */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Yeni Ürünler</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                En son eklenen NFC takılarımızı inceleyin ve ilk siz sahip olun.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sevginizi Dijital Dünyaya Taşımaya Hazır mısınız?</h2>
          <p className="text-xl mb-8 text-blue-100">
            NFC teknolojisi ile donatılmış özel takılarımızla anılarınızı ölümsüzleştirin.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-blue-50">
              <Heart className="w-5 h-5 mr-2" />
              Alışverişe Başla
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
