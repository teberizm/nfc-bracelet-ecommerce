"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, Crown, Palette, Eye, Smartphone, Monitor, Tablet, Zap, Camera, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useContent, type Theme, type MediaContent } from "@/contexts/content-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ThemeSelectionPageProps {
  params: {
    id: string
  }
}

export default function ThemeSelectionPage({ params }: ThemeSelectionPageProps) {
  const { state: authState, dispatch: authDispatch } = useAuth()
  const { state, dispatch, getOrderContent } = useContent()
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<MediaContent | null>(null)
  const [showCoverSelector, setShowCoverSelector] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile")
  

  const orderId = params.id
  const orderContent = getOrderContent(orderId)
  const order = authState.orders.find((o) => o.id === orderId)

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sipariş Bulunamadı</h1>
          <Button asChild>
            <Link href="/profile">Profilime Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!orderContent || orderContent.mediaItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">İçerik Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Tema seçmek için önce içerik eklemelisiniz.</p>
          <Button asChild>
            <Link href={`/order/${orderId}/content`}>İçerik Eklemeye Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = orderContent.mediaItems.filter((item) => item.type === "image")

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme)
    dispatch({ type: "SELECT_THEME", payload: { orderId, theme } })

    // Tema seçildikten sonra kapak fotoğrafı seçimini göster
    if (images.length > 0) {
      setShowCoverSelector(true)
    }
  }

  const handleCoverPhotoSelect = (photo: MediaContent) => {
    setSelectedCoverPhoto(photo)

    // Seçilen fotoğrafı en başa taşı
    const updatedMediaItems = [photo, ...orderContent.mediaItems.filter((item) => item.id !== photo.id)]

    dispatch({
      type: "SET_ORDER_CONTENT",
      payload: {
        orderId,
        content: {
          ...orderContent,
          mediaItems: updatedMediaItems,
        },
      },
    })

    setShowCoverSelector(false)

    toast({
      title: "Kapak Fotoğrafı Seçildi! 📸",
      description: `"${photo.title}" kapak fotoğrafı olarak ayarlandı.`,
    })
  }

  const handleSaveAndPublish = async () => {
    if (!selectedTheme) {
      toast({
        title: "Tema Seçin",
        description: "Devam etmek için bir tema seçmelisiniz.",
        variant: "destructive",
      })
      return
    }

    if (images.length > 0 && !selectedCoverPhoto) {
      toast({
        title: "Kapak Fotoğrafı Seçin",
        description: "Lütfen bir kapak fotoğrafı seçin.",
        variant: "destructive",
      })
      return
    }


     try {
      const token = localStorage.getItem("authToken")
      if (!token) throw new Error("Not authenticated")

      const body = {
        orderId,
        theme: selectedTheme.id,
        content: {
          coverPhotoId: selectedCoverPhoto?.id,
        },
      }

      const method = orderContent?.nfcContentId ? "PUT" : "POST"
      const response = await fetch("/api/nfc-content", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

    const data = await response.json()
      if (!data.success || !data.nfcContent) {
        throw new Error("Request failed")
      }

    dispatch({
        type: "SET_NFC_CONTENT_ID",
        payload: { orderId, nfcContentId: data.nfcContent.id },
      })

    dispatch({ type: "PUBLISH_CONTENT", payload: { orderId } })

      const updatedOrders = authState.orders.map((o) =>
        o.id === orderId
          ? { ...o, nfcContentUploaded: true, themeSelected: true }
          : o,
      )
      authDispatch({ type: "SET_ORDERS", payload: updatedOrders })

      toast({
        title: "Başarılı! 🎉",
        description: "NFC içeriğiniz hazırlandı ve yayınlandı.",
      })

      router.push(`/order/${orderId}/preview`)
    } catch (error) {
      console.error("NFC content save error:", error)
      toast({
        title: "Hata",
        description: "NFC içeriği kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      case "desktop":
        return <Monitor className="h-4 w-4" />
      default:
        return <Smartphone className="h-4 w-4" />
    }
  }

  const getDeviceSize = (device: string) => {
    switch (device) {
      case "mobile":
        return { width: "320px", height: "568px" }
      case "tablet":
        return { width: "768px", height: "1024px" }
      case "desktop":
        return { width: "1200px", height: "800px" }
      default:
        return { width: "320px", height: "568px" }
    }
  }

  const getProgressValue = () => {
    if (!selectedTheme) return 75
    if (images.length > 0 && !selectedCoverPhoto) return 85
    return 100
  }

  const getProgressText = () => {
    if (!selectedTheme) return "Adım 2/3: Tema Seçimi"
    if (images.length > 0 && !selectedCoverPhoto) return "Adım 3/3: Kapak Fotoğrafı"
    return "Hazır: Yayınlanabilir"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link href={`/order/${orderId}/content`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              İçerik Yüklemeye Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tema Seçimi</h1>
            <p className="text-gray-600">Sipariş #{orderId} için tema seçin ve özelleştirin</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">İlerleme</span>
            <span className="text-sm text-gray-600">{getProgressText()}</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sol Taraf - Tema Seçimi */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Temalar
                </CardTitle>
                <CardDescription>İçeriğiniz için uygun temayı seçin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.availableThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTheme?.id === theme.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    {selectedTheme?.id === theme.id && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-600 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}

                    <Image
                      src={theme.preview || "/placeholder.svg"}
                      alt={theme.name}
                      width={200}
                      height={120}
                      className="w-full h-24 object-cover rounded mb-3"
                    />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{theme.name}</h3>
                        {theme.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-600">{theme.description}</p>
                      {theme.isPremium && <Badge variant="secondary">Premium</Badge>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Kapak Fotoğrafı Seçimi */}
            {selectedTheme && images.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Kapak Fotoğrafı
                  </CardTitle>
                  <CardDescription>Ana sayfada görünecek fotoğrafı seçin</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCoverPhoto ? (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden">
                        <Image
                          src={selectedCoverPhoto.content || "/placeholder.svg"}
                          alt={selectedCoverPhoto.title}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 text-white rounded-full p-1">
                            <Star className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{selectedCoverPhoto.title}</p>
                        <p className="text-xs text-gray-600">Kapak fotoğrafı olarak seçildi</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowCoverSelector(true)} className="w-full">
                        Değiştir
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">Kapak fotoğrafı seçin</p>
                      <Button variant="outline" onClick={() => setShowCoverSelector(true)} className="w-full">
                        Fotoğraf Seç
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          
          </div>

          {/* Orta - Önizleme */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Önizleme
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {["mobile", "tablet", "desktop"].map((device) => (
                      <Button
                        key={device}
                        variant={previewDevice === device ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreviewDevice(device as any)}
                      >
                        {getDeviceIcon(device)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div
                    className="border rounded-lg overflow-hidden shadow-lg bg-white"
                    style={{
                      width: getDeviceSize(previewDevice).width,
                      height: getDeviceSize(previewDevice).height,
                      maxWidth: "100%",
                      maxHeight: "600px",
                      transform:
                        previewDevice === "desktop"
                          ? "scale(0.5)"
                          : previewDevice === "tablet"
                            ? "scale(0.6)"
                            : "scale(1)",
                      transformOrigin: "top center",
                    }}
                  >
                    {selectedTheme ? (
                      <iframe
                        src={`/demo/${selectedTheme.id}`}
                        title={`${selectedTheme.name} demo`}
                        className="w-full h-full border-0"
                      />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Camera className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <h1
                            className="text-lg font-bold mb-2"
                            style={{
                              color: selectedTheme.layout.accentColor,
                              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                            }}
                          >
                            {selectedTheme.id === "love"
                              ? "Bizim Hikayemiz"
                              : selectedTheme.id === "adventure"
                                ? "Macera Günlüğüm"
                                : "Anılarım"}
                          </h1>
                        </div>

                        {/* İçerik Önizleme */}
                        <div className="space-y-3">
                          {orderContent.mediaItems.slice(1, 4).map((item, index) => (
                            <div
                              key={item.id}
                              className="p-2 rounded text-xs"
                              style={{
                                backgroundColor: `${selectedTheme.layout.accentColor}20`,
                                
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {item.type === "image" && <div className="w-3 h-3 bg-green-500 rounded" />}
                                {item.type === "video" && <div className="w-3 h-3 bg-red-500 rounded" />}
                                {item.type === "audio" && <div className="w-3 h-3 bg-blue-500 rounded" />}
                                {item.type === "text" && <div className="w-3 h-3 bg-purple-500 rounded" />}
                                <span className="font-medium" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
                                  {item.title}
                                </span>
                              </div>
                              {item.type === "text" && (
                                <p
                                  className="opacity-75 line-clamp-2"
                                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                                >
                                  {item.content}
                                </p>
                              )}
                            </div>
                          ))}
                          {orderContent.mediaItems.length > 4 && (
                            <div
                              className="text-center text-xs opacity-75"
                              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                            >
                              +{orderContent.mediaItems.length - 4} daha fazla içerik
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p>Tema seçin</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Taraf - Özet ve Kaydet */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* İçerik Özeti */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">İçerik Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Toplam İçerik:</span>
                    <Badge variant="secondary">{orderContent.mediaItems.length}</Badge>
                  </div>
                  {["image", "video", "audio", "text"].map((type) => {
                    const count = orderContent.mediaItems.filter((item) => item.type === type).length
                    if (count === 0) return null
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="capitalize">
                          {type === "image"
                            ? "Fotoğraf"
                            : type === "video"
                              ? "Video"
                              : type === "audio"
                                ? "Ses"
                                : "Metin"}
                          :
                        </span>
                        <span>{count}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Seçilen Tema */}
              {selectedTheme && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seçilen Tema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Image
                        src={selectedTheme.preview || "/placeholder.svg"}
                        alt={selectedTheme.name}
                        width={200}
                        height={120}
                        className="w-full h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {selectedTheme.name}
                          {selectedTheme.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedTheme.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Kaydet ve Yayınla */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleSaveAndPublish}
                    className="w-full"
                    size="lg"
                    disabled={!selectedTheme || (images.length > 0 && !selectedCoverPhoto)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Kaydet ve Yayınla
                  </Button>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    {!selectedTheme
                      ? "Önce bir tema seçin"
                      : images.length > 0 && !selectedCoverPhoto
                        ? "Kapak fotoğrafı seçin"
                        : "NFC içeriğiniz hazırlanacak"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Kapak Fotoğrafı Seçici Modal */}
        <Dialog open={showCoverSelector} onOpenChange={setShowCoverSelector}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Kapak Fotoğrafı Seçin
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-6">
                Bu fotoğraf sayfanızın en üstünde büyük bir daire içinde görünecek. En güzel çift fotoğrafınızı seçin!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 border-4 ${
                      selectedCoverPhoto?.id === image.id
                        ? "border-blue-500 shadow-lg"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => handleCoverPhotoSelect(image)}
                  >
                    <Image src={image.content || "/placeholder.svg"} alt={image.title} fill className="object-cover" />
                    {selectedCoverPhoto?.id === image.id && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-medium truncate">{image.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
