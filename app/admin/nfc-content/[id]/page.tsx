"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Clock, CheckCircle, XCircle, Upload, Trash2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAdmin } from "@/contexts/admin-context"
import { toast } from "sonner"

// Mock NFC içerik verisi
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
  const [nfcContent, setNfcContent] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  useEffect(() => {
    // NFC içerik verilerini yükle
    const loadNFCContent = async () => {
      setIsLoading(true)
      // API call simulation
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Mock veriyi kullan
      setNfcContent(mockNFCContent)
      setIsLoading(false)
    }
    
    loadNFCContent()
  }, [params.id])

  const handleSave = async () => {
    setIsSaving(true)
    // API call simulation
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

  const handleStatusChange = (status: string) => {
    setNfcContent({
      ...nfcContent,
      status,
      updatedAt: new Date().toISOString(),
    })
    toast.success(`Durum "${getStatusText(status)}" olarak güncellendi`)
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
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            İşleniyor
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Bekliyor"
      case "in_progress":
        return "İşleniyor"
      case "completed":
        return "Tamamlandı"
      case "rejected":
        return "Reddedildi"
      default:
        return status
    }
  }

  // WhatsApp'a yönlendirme
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

  if (!nfcContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">İçerik Bulunamadı</h2>
          <p className="text-gray-500 mb-4">İstediğiniz NFC içeriği bulunamadı veya erişim izniniz yok.</p>
          <Button asChild>
            <Link href="/admin/nfc-content">NFC İçeriklerine Dön</Link>
          </Button>
        </div>
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
            {/* Temel İçerik */}
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
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={nfcContent.theme}
                    onValueChange={(value) => setNfcContent({ ...nfcContent, theme: value })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Tema seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aşk">Aşk</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fotoğraf */}
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

          {/* Durum */}
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
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="status">Durumu Güncelle</Label>
                  <Select value={nfcContent.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Bekliyor</SelectItem>
                      <SelectItem value="in_progress">İşleniyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="rejected">Reddedildi</SelectItem>\
                    </SelectContent>
