import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Upload, Palette, Factory, Zap, CheckCircle, Heart, Smartphone } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      title: "Sipariş Verin",
      description: "Beğendiğiniz NFC bilekliği seçin ve sipariş verin. Ödeme işlemini tamamlayın.",
      icon: ShoppingCart,
      color: "bg-blue-500",
      details: ["Ürün kataloğumuzu inceleyin", "Size uygun bilekliği seçin", "Güvenli ödeme ile sipariş verin"],
    },
    {
      id: 2,
      title: "İçerik Yükleyin",
      description: "Paylaşmak istediğiniz fotoğrafları, videoları ve mesajları yükleyin.",
      icon: Upload,
      color: "bg-green-500",
      details: ["Özel fotoğraflarınızı ekleyin", "Video mesajları yükleyin", "Kişisel notlarınızı yazın"],
    },
    {
      id: 3,
      title: "Tema Seçin",
      description: "Bilekliğinizin görünümünü kişiselleştirin. Renk, font ve düzen seçin.",
      icon: Palette,
      color: "bg-purple-500",
      details: ["Renk paletini belirleyin", "Font stilini seçin", "Düzeni özelleştirin"],
    },
    {
      id: 4,
      title: "Üretim Süreci",
      description: "Bilekliğiniz özel olarak üretilir ve NFC teknolojisi entegre edilir.",
      icon: Factory,
      color: "bg-orange-500",
      details: ["Özel üretim başlar", "NFC çipi programlanır", "Kalite kontrolü yapılır"],
    },
    {
      id: 5,
      title: "Paylaşın ve Keyfini Çıkarın",
      description: "Bilekliğinizi alın ve sevdiklerinizle anılarınızı anında paylaşmaya başlayın!",
      icon: Zap,
      color: "bg-pink-500",
      details: ["Bilekliğinizi takın", "Telefonu yaklaştırın", "Anılarınız anında paylaşılsın!"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Zap className="h-4 w-4 mr-2" />
            Adım Adım Rehber
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Nasıl Çalışır?</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            NFC bilekliğinizi 5 kolay adımda oluşturun ve sevdiklerinizle özel anılarınızı paylaşmaya başlayın.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="relative mb-12 last:mb-0">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-20 bg-gradient-to-b from-gray-300 to-gray-200 hidden md:block" />
                )}

                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Step Number & Icon */}
                      <div
                        className={`${step.color} p-8 text-white flex flex-col items-center justify-center min-h-[200px] md:min-w-[200px]`}
                      >
                        <div className="bg-white/20 rounded-full p-4 mb-4">
                          <step.icon className="h-8 w-8" />
                        </div>
                        <div className="text-3xl font-bold mb-2">Adım {step.id}</div>
                        <div className="text-center font-semibold">{step.title}</div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-8">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">{step.title}</h3>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{step.description}</p>

                        <div className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Neden NFC Bileklik?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Geleneksel paylaşım yöntemlerinden farklı olarak, NFC teknolojisi ile anılarınızı anında ve kolay bir
              şekilde paylaşabilirsiniz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Uygulama Gerektirmez</h3>
              <p className="text-gray-600">
                Sadece telefonu yaklaştırın, anılarınız anında açılsın. Herhangi bir uygulama indirmeye gerek yok!
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Duygusal Bağ</h3>
              <p className="text-gray-600">
                Sevdiklerinizle özel anılarınızı paylaşarak daha güçlü duygusal bağlar kurun.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Anında Paylaşım</h3>
              <p className="text-gray-600">
                Fotoğraf, video ve mesajlarınızı saniyeler içinde paylaşın. Hızlı ve pratik!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın!</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            İlk NFC bilekliğinizi sipariş edin ve teknolojinin gücünü keşfedin. Sevdiklerinizle özel anılarınızı
            paylaşmaya başlayın!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/products">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ürünleri İncele
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <Link href="/custom-design">
                <Palette className="h-5 w-5 mr-2" />
                Kendin Tasarla
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
