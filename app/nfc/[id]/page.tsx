"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Save, Clock, CheckCircle, Upload, Trash2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdmin } from "@/contexts/admin-context"
import { toast } from "sonner"

const mockNFCContent = {
  id: "nfc-1",
  orderId: "order-1",
  orderNumber: "ORD-2024-001",
  customerName: "Ahmet Yılmaz",
  customerEmail: "ahmet@example.com",
  customerPhone: "+90 555 123 4567",
  productName: "Premium NFC Deri Bileklik",
  theme: "Aşk",
  status: "completed",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T14:20:00Z",
  content: {
    name: "Ahmet & Ayşe",
    message: "Sonsuz aşkımızın simgesi",
    photo: "/placeholder.svg?height=400&width=400",
    socialLinks: {
      instagram: "@ahmet_ayse",
      facebook: "ahmet.ayse",
      linkedin: "ahmet-yilmaz",
      twitter: "@ahmet_ayse",
      whatsapp: "+90 555 123 4567",
      email: "ahmet@example.com",
      website: "https://ahmetayse.com",
    },
  },
}

export default function NFCContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state } = useAdmin()
  const [nfcContent, setNfcContent] = useState<any>(mockNFCContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("NFC içerik bilgileri güncellendi")
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setNfcContent({
            ...nfcContent,
            content: {
              ...nfcContent.content,
              photo: e.target.result,
            },
          })
          toast.success("Fotoğraf yüklendi")
        }
      }
      reader.readAsDataURL(files[0])
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const openWhatsApp = () => {
    if (!nfcContent) return
    const formattedPhone = nfcContent.customerPhone.replace(/\s+/g, "")
    const message = `Merhaba ${nfcContent.customerName}, NFC içeriğiniz hakkında bilgi vermek istiyorum.`
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{nfcContent.content.name}</h1>
            <p className="text-gray-500">
              {nfcContent.orderNumber} - {nfcContent.customerName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openWhatsApp}>
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            WhatsApp
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">İçerik</TabsTrigger>
          <TabsTrigger value="social">Sosyal Medya</TabsTrigger>
          <TabsTrigger value="preview">Önizleme</TabsTrigger>
          <TabsTrigger value="customer">Müşteri Bilgileri</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>İçerik Bilgileri</CardTitle>
                <CardDescription>NFC içeriğinin temel bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İsim / Başlık</Label>
                  <Input
                    id="name"
                    value={nfcContent.content.name}
                    onChange={(e) =>
                      setNfcContent({
                        ...nfcContent,
                        content: { ...nfcContent.content, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mesaj</Label>
                  <Textarea
                    id="message"
                    value={nfcContent.content.message}
                    onChange={(e) =>
                      setNfcContent({
                        ...nfcContent,
                        content: { ...nfcContent.content, message: e.target.value },
                      })
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fotoğraf</CardTitle>
                <CardDescription>NFC içeriğinde görüntülenecek fotoğraf</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  {nfcContent.content.photo ? (
                    <div className="relative group mb-4">
                      <Image
                        src={nfcContent.content.photo || "/placeholder.svg"}
                        alt="NFC İçerik Fotoğrafı"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          setNfcContent({
                            ...nfcContent,
                            content: { ...nfcContent.content, photo: null },
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 w-full">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Fotoğraf yüklenmemiş</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {nfcContent.content.photo ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>İçerik Durumu</CardTitle>
              <CardDescription>NFC içeriğinin mevcut durumu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Mevcut Durum:</span>
                  <div>{getStatusBadge(nfcContent.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Medya Linkleri</CardTitle>
              <CardDescription>NFC içeriğinde görüntülenecek sosyal medya hesapları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@kullanici_adi"
                    value={nfcContent.content.socialLinks.instagram}
                    onChange={(e) =>
                      setNfcContent({
                        ...nfcContent,
                        content: {
                          ...nfcContent.content,
                          socialLinks: {
                            ...nfcContent.content.socialLinks,
                            instagram: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="kullanici.adi"
                    value={nfcContent.content.socialLinks.facebook}
                    onChange={(e) =>
                      setNfcContent({
                        ...nfcContent,
                        content: {
                          ...nfcContent.content,
                          socialLinks: {
                            ...nfcContent.content.socialLinks,
                            facebook: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>NFC İçerik Önizlemesi</CardTitle>
              <CardDescription>İçeriğin nasıl görüneceğinin önizlemesi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center mb-4">
                    {nfcContent.content.photo && (
                      <Image
                        src={nfcContent.content.photo || "/placeholder.svg"}
                        alt="Profil"
                        width={120}
                        height={120}
                        className="rounded-full mx-auto mb-4 object-cover"
                      />
                    )}
                    <h2 className="text-xl font-bold">{nfcContent.content.name}</h2>
                    <p className="text-gray-600 mt-2">{nfcContent.content.message}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
              <CardDescription>Sipariş veren müşterinin bilgileri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Müşteri Adı</Label>
                    <p className="text-lg">{nfcContent.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">E-posta</Label>
                    <p className="text-lg">{nfcContent.customerEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Telefon</Label>
                    <p className="text-lg">{nfcContent.customerPhone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Sipariş No</Label>
                    <p className="text-lg">{nfcContent.orderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ürün</Label>
                    <p className="text-lg">{nfcContent.productName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tema</Label>
                    <p className="text-lg">{nfcContent.theme}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
