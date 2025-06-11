"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageCircle, Package, Truck, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface OrderDetail {
  id: string
  order_number: string
  user_email: string
  user_phone: string
  first_name: string
  last_name: string
  total_amount: number
  subtotal: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  updated_at: string
  shipping_address: any
  billing_address: any
  tracking_number?: string
  payment_method: string
  notes?: string
  items: Array<{
    id: string
    product_name: string
    product_image: string
    quantity: number
    unit_price: number
    total_price: number
    nfc_enabled: boolean
  }>
  statusHistory?: Array<{
    id: string
    status: string
    note?: string
    created_at: string
    admin_name?: string
  }>
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  pending: "Beklemede",
  processing: "İşleniyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
}

const statusIcons = {
  pending: Package,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [note, setNote] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchOrderDetail()
    }
  }, [params.id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      console.log("Fetching order detail for:", params.id)

      const response = await fetch(`/api/admin/orders/${params.id}`)
      const data = await response.json()

      console.log("Order detail response:", data)

      if (data.success) {
        setOrder(data.order)
        setNewStatus(data.order.status)
        setTrackingNumber(data.order.tracking_number || "")
      } else {
        toast({
          title: "Hata",
          description: data.message || "Sipariş yüklenirken hata oluştu",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching order detail:", error)
      toast({
        title: "Hata",
        description: "Sipariş yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return

    try {
      setUpdating(true)
      console.log("Updating order status:", { newStatus, note, trackingNumber })

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          note,
          trackingNumber: trackingNumber || undefined,
        }),
      })

      const data = await response.json()
      console.log("Update response:", data)

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Sipariş durumu güncellendi",
        })
        setNote("")
        fetchOrderDetail()
      } else {
        toast({
          title: "Hata",
          description: data.message || "Güncelleme sırasında hata oluştu",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Hata",
        description: "Güncelleme sırasında hata oluştu",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getWhatsAppUrl = (phone: string, orderNumber: string) => {
    const cleanPhone = phone.replace(/\D/g, "")
    const message = `Merhaba! ${orderNumber} numaralı siparişiniz hakkında bilgi vermek istiyorum.`
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sipariş bulunamadı.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/orders">Siparişlere Dön</Link>
        </Button>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Sipariş #{order.order_number}</h1>
          <p className="text-gray-600">
            {new Date(order.created_at).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Sipariş Detayları */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Durumu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Sipariş Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                {order.tracking_number && <Badge variant="outline">Takip No: {order.tracking_number}</Badge>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Yeni Durum</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="processing">İşleniyor</SelectItem>
                      <SelectItem value="shipped">Kargoda</SelectItem>
                      <SelectItem value="delivered">Teslim Edildi</SelectItem>
                      <SelectItem value="cancelled">İptal Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Kargo Takip No</label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Takip numarası girin"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Not</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Durum değişikliği için not ekleyin"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={updating || (newStatus === order.status && !trackingNumber)}
              >
                {updating ? "Güncelleniyor..." : "Durumu Güncelle"}
              </Button>
            </CardContent>
          </Card>

          {/* Sipariş Öğeleri */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Öğeleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.product_image || "/placeholder.svg"}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {item.unit_price.toLocaleString("tr-TR")} ₺
                        </p>
                        {item.nfc_enabled && <Badge variant="secondary">NFC Etkin</Badge>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.total_price.toLocaleString("tr-TR")} ₺</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Sipariş öğeleri bulunamadı</p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span>{order.subtotal.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam:</span>
                  <span>{order.total_amount.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Durum Geçmişi */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Durum Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory.map((history, index) => (
                    <div key={history.id || index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge className={statusColors[history.status as keyof typeof statusColors]}>
                        {statusLabels[history.status as keyof typeof statusLabels]}
                      </Badge>
                      <div className="flex-1">
                        {history.note && <p className="text-sm">{history.note}</p>}
                        <p className="text-xs text-gray-500">
                          {new Date(history.created_at).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {history.admin_name && ` - ${history.admin_name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sağ Kolon - Müşteri Bilgileri */}
        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">
                  {order.first_name} {order.last_name}
                </h4>
                <p className="text-sm text-gray-600">{order.user_email}</p>
                {order.user_phone && <p className="text-sm text-gray-600">{order.user_phone}</p>}
              </div>

              {order.user_phone && (
                <Button size="sm" className="w-full" asChild>
                  <a
                    href={getWhatsAppUrl(order.user_phone, order.order_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp ile İletişim
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Ödeme Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ödeme Yöntemi:</span>
                  <span className="capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toplam Tutar:</span>
                  <span className="font-medium">{order.total_amount.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teslimat Adresi */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle>Teslimat Adresi</CardTitle>
              </CardHeader>
              <CardContent>
                {typeof order.shipping_address === "object" ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.shipping_address.name}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.district}, {order.shipping_address.city}
                    </p>
                    <p>{order.shipping_address.postal_code}</p>
                    {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Adres bilgisi mevcut değil</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notlar */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notlar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
