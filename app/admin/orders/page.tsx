"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageCircle, Search, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  user_email: string
  first_name: string
  last_name: string
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
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

export default function AdminOrdersPage() {
  const { state } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
  })

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchOrders()
    }
  }, [state.isAuthenticated, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)
      params.append("sortBy", filters.sortBy)
      params.append("sortOrder", filters.sortOrder)

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return

    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const response = await fetch("/api/admin/orders/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: newStatus,
          note: `Toplu güncelleme ile ${statusLabels[newStatus as keyof typeof statusLabels]} durumuna geçirildi`,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSelectedOrders([])
        fetchOrders()
      }
    } catch (error) {
      console.error("Error updating orders:", error)
    }
  }

  const getWhatsAppUrl = (phone: string, orderNumber: string) => {
    const message = `Merhaba! ${orderNumber} numaralı siparişiniz hakkında bilgi vermek istiyorum.`
    return `https://wa.me/90${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sipariş Yönetimi</h1>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Sipariş no, müşteri ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="processing">İşleniyor</SelectItem>
                <SelectItem value="shipped">Kargoda</SelectItem>
                <SelectItem value="delivered">Teslim Edildi</SelectItem>
                <SelectItem value="cancelled">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Tarih</SelectItem>
                <SelectItem value="total_amount">Tutar</SelectItem>
                <SelectItem value="status">Durum</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortOrder} onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Azalan</SelectItem>
                <SelectItem value="asc">Artan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toplu İşlemler */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{selectedOrders.length} sipariş seçildi</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkStatusUpdate("processing")}>
                  İşleme Al
                </Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate("shipped")}>
                  Kargoya Ver
                </Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate("delivered")}>
                  Teslim Et
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkStatusUpdate("cancelled")}>
                  İptal Et
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sipariş Listesi */}
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedOrders([...selectedOrders, order.id])
                      } else {
                        setSelectedOrders(selectedOrders.filter((id) => id !== order.id))
                      }
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{order.order_number}</h3>
                      <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.first_name} {order.last_name} • {order.user_email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("tr-TR")} •{" "}
                      {order.total_amount.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={getWhatsAppUrl("5551234567", order.order_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/admin/orders/${order.id}`}>Detay</Link>
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-gray-600">
                      {item.quantity}x {item.product_name}
                    </div>
                  ))}
                  {order.items.length > 3 && <div className="text-gray-500">+{order.items.length - 3} ürün daha</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">Henüz sipariş bulunmuyor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
