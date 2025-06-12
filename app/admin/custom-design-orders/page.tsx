"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAdmin } from "@/contexts/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface CustomDesignOrder {
  id: string
  first_name: string
  last_name: string
  user_email: string
  product_type: string
  material: string
  status: string
  payment_status: string
  price: number | null
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminCustomDesignOrdersPage() {
  const { state } = useAdmin()
  const [orders, setOrders] = useState<CustomDesignOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchOrders()
    }
  }, [state.isAuthenticated])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/custom-design-orders")
      const data = await res.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error("Error fetching custom design orders", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Kendin Tasarla Siparişleri</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {order.first_name} {order.last_name}
                  </h3>
                  <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{order.user_email}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div className="text-right space-y-2">
                <p className="text-sm">
                  {order.price !== null
                    ? `${order.price.toLocaleString("tr-TR")} ₺`
                    : "fiyat bilgisi girilmedi."}
                </p>
                <Button size="sm" asChild>
                  <Link href={`/admin/custom-design-orders/${order.id}`}>Detay</Link>
                </Button>
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