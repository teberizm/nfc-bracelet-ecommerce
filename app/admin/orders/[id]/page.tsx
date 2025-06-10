"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  MessageCircle,
  User,
  MapPin,
  CreditCard,
  FileText,
  Zap,
  Edit,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdmin } from "@/contexts/admin-context"
import { toast } from "sonner"

// Mock sipariş verileri
const mockOrders = [
  {
    id: "order-1",
    orderNumber: "ORD-2024-001",
    customerName: "Ahmet Yılmaz",
    customerEmail: "ahmet@example.com",
    customerPhone: "+90 555 123 4567",
    date: "2024-01-15T10:30:00Z",
    total: 299,
    subtotal: 299,
    tax: 0,
    shipping: 0,
    discount: 0,
    status: "pending",
    paymentStatus: "paid",
    paymentMethod: "Kredi Kartı",
    trackingNumber: "",
    notes: "",
    items: [
      {
        id: "item-1",
        productId: "1",
        productName: "Premium NFC Deri Bileklik",
        quantity: 1,
        price: 299,
        image: "/placeholder.svg?height=100&width=100",
        nfcEnabled: true,
        nfcContentUploaded: false,
        themeSelected: false,
      },
    ],
    shippingAddress: {
      name: "Ahmet Yılmaz",
      street: "Atatürk Caddesi No: 123",
      city: "İstanbul",
      state: "İstanbul",
      zipCode: "34000",
      country: "Türkiye",
    },
    billingAddress: {
      name: "Ahmet Yılmaz",
      street: "Atatürk Caddesi No: 123",
      city: "İstanbul",
      state: "İstanbul",
      zipCode: "34000",
      country: "Türkiye",
    },
    statusHistory: [
      {
        status: "pending",
        date: "2024-01-15T10:30:00Z",
        note: "Sipariş alındı",
      },
    ],
  },
]

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state } = useAdmin()
  const [order, setOrder] = useState<any>(null)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [isEditingTracking, setIsEditingTracking] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  useEffect(() => {
    // Sipariş verilerini yükle
    const loadOrder = async () => {
      setIsLoading(true)
      // API call simulation
      await new Promise((resolve) => setTimeout(resolve, 500))

      const orderId = params.id
      const foundOrder = mockOrders.find((o) => o.id === orderId)

      if (foundOrder) {
        setOrder(foundOrder)
        setNewStatus(foundOrder.status)
        setTrackingNumber(foundOrder.trackingNumber)
      }

      setIsLoading(false)
    }

    loadOrder()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Sipariş Bulunamadı</h2>
          <p className="text-gray-500 mb-4">İstediğiniz sipariş bulunamadı veya erişim izniniz yok.</p>
          <Button asChild>
            <Link href="/admin/orders">Siparişlere Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Sipariş durumu güncelleme
  const updateOrderStatus = () => {
    if (newStatus === order.status) {
      setIsEditingStatus(false)
      return
    }

    const updatedOrder = {
      ...order,
      status: newStatus,
      statusHistory: [
        {
          status: newStatus,
          date: new Date().toISOString(),
          note: statusNote,
        },
        ...order.statusHistory,
      ],
    }

    setOrder(updatedOrder)
    setIsEditingStatus(false)
    setStatusNote("")

    toast.success(`Sipariş durumu "${getStatusText(newStatus)}" olarak güncellendi.`)
  }

  // Takip numarası güncelleme
  const updateTrackingNumber = () => {
    const updatedOrder = {
      ...order,
      trackingNumber,
    }

    setOrder(updatedOrder)
    setIsEditingTracking(false)

    toast.success("Kargo takip numarası başarıyla güncellendi.")
  }

  // WhatsApp'a yönlendirme
  const openWhatsApp = () => {
    const formattedPhone = order.customerPhone.replace(/\s+/g, "")
    const message = `Merhaba ${order.customerName}, ${order.orderNumber} numaralı siparişiniz hakkında bilgi vermek istiyorum.`
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Durum metni
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Onay Bekliyor"
      case "processing":
        return "İşleniyor"
      case "shipped":
        return "Kargoya Verildi"
      case "completed":
        return "Tamamlandı"
      case "failed":
        return "Başarısız"
      default:
        return status
    }
  }

  // Durum badge'i
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Onay Bekliyor
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            İşleniyor
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            <Truck className="h-3 w-3 mr-1" />
            Kargoya Verildi
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Başarısız
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sipariş #{order.orderNumber}</h1>
            <p className="text-gray-600">
              {new Date(order.date).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={openWhatsApp}>
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Sipariş Detayları */}
        <div className="lg:col-span-2 space-y-6">
          {/* Durum */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sipariş Durumu</CardTitle>
                {!isEditingStatus && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingStatus(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Durumu Güncelle
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingStatus ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Yeni Durum</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Onay Bekliyor</SelectItem>
                        <SelectItem value="processing">İşleniyor</SelectItem>
                        <SelectItem value="shipped">Kargoya Verildi</SelectItem>
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                        <SelectItem value="failed">Başarısız</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statusNote">Not (Opsiyonel)</Label>
                    <Textarea
                      id="statusNote"
                      placeholder="Durum değişikliği hakkında not ekleyin..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={updateOrderStatus}>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingStatus(false)}>
                      <X className="h-4 w-4 mr-2" />
                      İptal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">{getStatusBadge(order.status)}</div>
                  </div>

                  {order.status === "shipped" && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Kargo Takip Numarası</p>
                          {isEditingTracking ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Takip numarası girin"
                                className="max-w-xs"
                              />
                              <Button size="sm" onClick={updateTrackingNumber}>
                                <Save className="h-3 w-3 mr-1" />
                                Kaydet
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setIsEditingTracking(false)}>
                                <X className="h-3 w-3 mr-1" />
                                İptal
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-gray-600">{order.trackingNumber || "Takip numarası girilmemiş"}</p>
                              <Button size="sm" variant="ghost" onClick={() => setIsEditingTracking(true)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ürünler */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Ürünleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.productName}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="font-bold">₺{(item.price * item.quantity).toLocaleString("tr-TR")}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600">
                          {item.quantity} adet × ₺{item.price.toLocaleString("tr-TR")}
                        </p>
                        {item.nfcEnabled && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            NFC Özellikli
                          </Badge>
                        )}
                      </div>
                      {item.nfcEnabled && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={item.nfcContentUploaded ? "outline" : "secondary"}
                            className={item.nfcContentUploaded ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {item.nfcContentUploaded ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.nfcContentUploaded ? "İçerik Yüklendi" : "İçerik Bekleniyor"}
                          </Badge>
                          <Badge
                            variant={item.themeSelected ? "outline" : "secondary"}
                            className={item.themeSelected ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {item.themeSelected ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {item.themeSelected ? "Tema Seçildi" : "Tema Bekleniyor"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Durum Geçmişi */}
          <Card>
            <CardHeader>
              <CardTitle>Durum Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((history: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        history.status === "pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : history.status === "processing"
                            ? "bg-blue-100 text-blue-600"
                            : history.status === "shipped"
                              ? "bg-purple-100 text-purple-600"
                              : history.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                      }`}
                    >
                      {history.status === "pending" ? (
                        <Clock className="h-4 w-4" />
                      ) : history.status === "processing" ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : history.status === "shipped" ? (
                        <Truck className="h-4 w-4" />
                      ) : history.status === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{getStatusText(history.status)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(history.date).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {history.note && <p className="text-sm text-gray-600 mt-1">{history.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Müşteri ve Ödeme Bilgileri */}
        <div className="lg:col-span-1 space-y-6">
          {/* Müşteri Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-lg">{order.customerName}</p>
                <p className="text-gray-600">{order.customerEmail}</p>
                <p className="text-gray-600">{order.customerPhone}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={openWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp ile İletişim
              </Button>
            </CardContent>
          </Card>

          {/* Teslimat Adresi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Teslimat Adresi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ödeme Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Ödeme Yöntemi:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ödeme Durumu:</span>
                  <Badge
                    variant="outline"
                    className={
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : order.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {order.paymentStatus === "paid"
                      ? "Ödendi"
                      : order.paymentStatus === "pending"
                        ? "Bekliyor"
                        : "Başarısız"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span>₺{order.subtotal.toLocaleString("tr-TR")}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span>KDV:</span>
                    <span>₺{order.tax.toLocaleString("tr-TR")}</span>
                  </div>
                )}
                {order.shipping > 0 && (
                  <div className="flex justify-between">
                    <span>Kargo:</span>
                    <span>₺{order.shipping.toLocaleString("tr-TR")}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span>İndirim:</span>
                    <span>-₺{order.discount.toLocaleString("tr-TR")}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Toplam:</span>
                  <span>₺{order.total.toLocaleString("tr-TR")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.notes ? <p>{order.notes}</p> : <p className="text-gray-500 italic">Not eklenmemiş</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
