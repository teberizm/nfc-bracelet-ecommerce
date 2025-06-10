"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Save, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdmin } from "@/contexts/admin-context"
import { toast } from "sonner"

export default function NFCContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [nfcContent] = useState({
    id: "nfc-1",
    orderNumber: "ORD-2024-001",
    customerName: "Ahmet Yılmaz",
    customerPhone: "+90 555 123 4567",
    content: {
      name: "Ahmet & Ayşe",
      message: "Sonsuz aşkımızın simgesi",
      photo: "/placeholder.svg?height=400&width=400",
    },
  })

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

  const openWhatsApp = () => {
    const message = `Merhaba ${nfcContent.customerName}, NFC içeriğiniz hakkında bilgi vermek istiyorum.`
    const whatsappUrl = `https://wa.me/${nfcContent.customerPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>İçerik Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">İsim / Başlık</Label>
              <Input id="name" defaultValue={nfcContent.content.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mesaj</Label>
              <Textarea id="message" defaultValue={nfcContent.content.message} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fotoğraf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <Image
                src={nfcContent.content.photo || "/placeholder.svg"}
                alt="NFC İçerik Fotoğrafı"
                width={200}
                height={200}
                className="rounded-lg object-cover mb-4"
              />
              <Button variant="outline">Fotoğraf Yükle</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Müşteri Adı</Label>
                <p className="text-lg">{nfcContent.customerName}</p>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
