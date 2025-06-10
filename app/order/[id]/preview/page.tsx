"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Share2, Zap, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContent } from "@/contexts/content-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface PreviewPageProps {
  params: {
    id: string
  }
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { state: authState } = useAuth()
  const { getOrderContent } = useContent()

  const orderId = params.id
  const orderContent = getOrderContent(orderId)
  const order = authState.orders.find((o) => o.id === orderId)

  if (!order || !orderContent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">İçerik Bulunamadı</h1>
          <Button asChild>
            <Link href="/profile">Profilime Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleCopyUrl = () => {
    if (orderContent.nfcUrl) {
      navigator.clipboard.writeText(orderContent.nfcUrl)
      toast({
        title: "URL Kopyalandı!",
        description: "NFC URL'si panoya kopyalandı.",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share && orderContent.nfcUrl) {
      try {
        await navigator.share({
          title: "NFC Bileklik İçeriğim",
          text: "NFC bilekliğimdeki özel içerikleri görün!",
          url: orderContent.nfcUrl,
        })
      } catch (error) {
        handleCopyUrl()
      }
    } else {
      handleCopyUrl()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Profilime Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              İçerik Hazır!
            </h1>
            <p className="text-gray-600">Sipariş #{orderId} için NFC içeriğiniz başarıyla oluşturuldu</p>
          </div>
        </div>

        {/* Başarı Mesajı */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">NFC İçeriğiniz Hazır!</h2>
                <p className="text-green-700">
                  Bilekliğiniz kargoya verildiğinde NFC çipi otomatik olarak bu içerikle eşleştirilecek.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Taraf - İçerik Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seçilen Tema */}
            {orderContent.selectedTheme && (
              <Card>
                <CardHeader>
                  <CardTitle>Seçilen Tema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Image
                      src={orderContent.selectedTheme.preview || "/placeholder.svg"}
                      alt={orderContent.selectedTheme.name}
                      width={120}
                      height={80}
                      className="rounded object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{orderContent.selectedTheme.name}</h3>
                      <p className="text-gray-600">{orderContent.selectedTheme.description}</p>
                      {orderContent.selectedTheme.isPremium && <Badge className="mt-2">Premium Tema</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* İçerik Listesi */}
            <Card>
              <CardHeader>
                <CardTitle>Yüklenen İçerikler ({orderContent.mediaItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderContent.mediaItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      {item.type === "image" && (
                        <Image
                          src={item.content || "/placeholder.svg"}
                          alt={item.title}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      )}
                      {item.type !== "image" && (
                        <div className="w-15 h-15 bg-gray-200 rounded flex items-center justify-center">
                          {item.type === "video" && <div className="w-4 h-4 bg-red-500 rounded" />}
                          {item.type === "audio" && <div className="w-4 h-4 bg-blue-500 rounded" />}
                          {item.type === "text" && <div className="w-4 h-4 bg-purple-500 rounded" />}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">
                          {item.type === "text"
                            ? `${item.content.length} karakter`
                            : item.duration
                              ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, "0")}`
                              : "Medya dosyası"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {item.type === "image"
                          ? "Fotoğraf"
                          : item.type === "video"
                            ? "Video"
                            : item.type === "audio"
                              ? "Ses"
                              : "Metin"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* NFC URL */}
            {orderContent.nfcUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>NFC Bağlantısı</CardTitle>
                  <CardDescription>Bu URL bilekliğinizin NFC çipine yüklenecek</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <code className="flex-1 text-sm">{orderContent.nfcUrl}</code>
                    <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={orderContent.nfcUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sağ Taraf - Sipariş Bilgileri ve Aksiyonlar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Sipariş Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle>Sipariş Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        width={50}
                        height={50}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-600">{item.quantity} adet</p>
                        {item.nfcEnabled && (
                          <Badge variant="secondary" className="mt-1">
                            <Zap className="h-3 w-3 mr-1" />
                            NFC Aktif
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Durum */}
              <Card>
                <CardHeader>
                  <CardTitle>İçerik Durumu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">İçerik Yüklendi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Tema Seçildi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">NFC Hazırlandı</span>
                  </div>
                </CardContent>
              </Card>

              {/* Aksiyonlar */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button onClick={handleShare} className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Paylaş
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/order/${orderId}/theme`}>Temayı Değiştir</Link>
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/order/${orderId}/content`}>İçerik Düzenle</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Bilgi */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto" />
                    <h3 className="font-semibold text-blue-800">NFC Nasıl Çalışır?</h3>
                    <p className="text-sm text-blue-700">
                      Bilekliğiniz elinize ulaştığında, herhangi bir NFC özellikli telefonu yaklaştırarak içeriklerinizi
                      anında görüntüleyebilirsiniz.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
