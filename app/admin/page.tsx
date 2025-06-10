"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/contexts/admin-context"

export default function AdminDashboard() {
  const { state } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  if (!state.admin || !state.stats) {
    return null
  }

  const statCards = [
    {
      title: "Toplam Kullanıcı",
      value: state.stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Toplam Sipariş",
      value: state.stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Toplam Gelir",
      value: `₺${state.stats.totalRevenue.toLocaleString("tr-TR")}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Aylık Büyüme",
      value: `%${state.stats.monthlyGrowth}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Hoş geldin, {state.admin.name}!</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Sipariş Durumu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Durumu */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Durumu</CardTitle>
              <CardDescription>Güncel sipariş durumları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold">{state.stats.pendingOrders}</p>
                  <p className="text-sm text-gray-600">Bekleyen</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">
                    {state.stats.totalOrders - state.stats.deliveredOrders - state.stats.pendingOrders}
                  </p>
                  <p className="text-sm text-gray-600">İşleniyor</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{state.stats.deliveredOrders}</p>
                  <p className="text-sm text-gray-600">Teslim Edildi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NFC İçerik Durumu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                NFC İçerik Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Aktif NFC İçerik:</span>
                  <Badge variant="secondary">{state.stats.activeNFCContent}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Toplam Ürün:</span>
                  <Badge variant="outline">{state.stats.totalProducts}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>NFC Aktiflik Oranı:</span>
                  <Badge className="bg-green-600">
                    %{Math.round((state.stats.activeNFCContent / state.stats.totalOrders) * 100)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Hızlı Aksiyonlar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Aksiyonlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Kullanıcı Yönetimi
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Ürün Yönetimi
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Sipariş Yönetimi
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                NFC İçerik Yönetimi
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Tema Yönetimi
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Sistem Ayarları
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
