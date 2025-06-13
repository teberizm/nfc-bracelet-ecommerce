"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useCustomDesignOrders,
  type CustomDesignOrder,
} from "@/hooks/use-custom-design-orders"
import { getWhatsAppUrl } from "@/lib/utils"
import { RefreshCw, ArrowLeft, MessageCircle } from "lucide-react"

 

export default function AdminCustomDesignOrderDetailPage() {
  const params = useParams()
  const { fetchOrder: fetchOrderApi, updateOrder } = useCustomDesignOrders()
  const [order, setOrder] = useState<CustomDesignOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState("pending")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [price, setPrice] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) loadOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchOrderApi(String(params.id))
      setOrder(data)
      setStatus(data.status)
      setPaymentStatus(data.payment_status)
      setPrice(data.price !== null ? data.price.toString() : "")
    } catch (err: any) {
      console.error("Error fetching order", err)
       setError(err.message || "Sipariş yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const parsedPrice = price === "" ? null : Number.parseFloat(price.replace(",", "."))
      const updated = await updateOrder(String(params.id), {
        status,
        payment_status: paymentStatus,
        price: parsedPrice,
      })
       setOrder(updated)
      setPrice(updated.price !== null ? updated.price.toString() : "")
    } catch (err) {
      console.error("Update error", err)
       
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500">{error}</p>
         <Button variant="outline" onClick={loadOrder}>
          <RefreshCw className="h-4 w-4 mr-2" /> Tekrar Dene
        </Button>
      </div>
    )
  }
  if (!order) {
    return (
      <div className="text-center py-12">Sipariş bulunamadı.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/custom-design-orders">
            <ArrowLeft className="h-4 w-4 mr-2" /> Geri
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {order.first_name} {order.last_name}
        </h1>
      </div>
	<Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{order.user_email}</p>
          {order.user_phone && <p className="text-sm text-gray-600">{order.user_phone}</p>}
          {order.user_phone && (
            <Button size="sm" className="w-full" asChild>
              <a href={getWhatsAppUrl(order.user_phone, order.id)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp ile İletişim
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sipariş Detayı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><span className="font-medium">Ürün Tipi:</span> {order.product_type}</p>
            <p><span className="font-medium">Malzeme:</span> {order.material}</p>
            <p><span className="font-medium">Açıklama:</span> {order.description}</p>
            {order.image_url && (
              <img src={order.image_url} alt="design" className="max-w-xs" />
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Durum</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="processing">İşleniyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Ödeme Durumu</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="paid">Ödendi</SelectItem>
                  <SelectItem value="failed">Başarısız</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Fiyat (₺)</label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Fiyat"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
