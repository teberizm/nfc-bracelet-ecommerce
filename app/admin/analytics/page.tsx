"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Zap, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StatCard {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
}

interface ChartData {
  name: string
  value: number
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")

  const stats: StatCard[] = [
    {
      title: "Toplam Kullanıcı",
      value: "147",
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Toplam Sipariş",
      value: "89",
      change: "+8%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Toplam Gelir",
      value: "₺26,750",
      change: "+15%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Aktif NFC İçerik",
      value: "45",
      change: "-3%",
      trend: "down",
      icon: Zap,
    },
  ]

  const salesData: ChartData[] = [
    { name: "Ocak", value: 4500 },
    { name: "Şubat", value: 5200 },
    { name: "Mart", value: 4800 },
    { name: "Nisan", value: 6100 },
    { name: "Mayıs", value: 5900 },
    { name: "Haziran", value: 7200 },
  ]

  const productData: ChartData[] = [
    { name: "Gümüş NFC Bileklik", value: 35 },
    { name: "Altın NFC Bileklik", value: 28 },
    { name: "Siyah NFC Bileklik", value: 18 },
    { name: "Rose Gold NFC Bileklik", value: 8 },
  ]

  const themeData: ChartData[] = [
    { name: "Aşk", value: 45 },
    { name: "Adventure", value: 32 },
    { name: "Business Pro", value: 28 },
    { name: "Creative", value: 15 },
  ]

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Ahmet Yılmaz",
      product: "Gümüş NFC Bileklik",
      amount: "₺299",
      status: "Tamamlandı",
      date: "2024-01-20",
    },
    {
      id: "ORD-002",
      customer: "Ayşe Demir",
      product: "Altın NFC Bileklik",
      amount: "₺399",
      status: "Kargoya Verildi",
      date: "2024-01-20",
    },
    {
      id: "ORD-003",
      customer: "Mehmet Kaya",
      product: "Siyah NFC Bileklik",
      amount: "₺249",
      status: "İşleniyor",
      date: "2024-01-19",
    },
    {
      id: "ORD-004",
      customer: "Fatma Özkan",
      product: "Rose Gold NFC Bileklik",
      amount: "₺349",
      status: "Onay Bekliyor",
      date: "2024-01-19",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tamamlandı":
        return "bg-green-100 text-green-800"
      case "Kargoya Verildi":
        return "bg-blue-100 text-blue-800"
      case "İşleniyor":
        return "bg-yellow-100 text-yellow-800"
      case "Onay Bekliyor":
        return "bg-orange-100 text-orange-800"
      case "Başarısız":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İstatistikler</h1>
          <p className="text-gray-500">Detaylı analiz ve raporlar</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 90 Gün</option>
            <option value="1y">Son 1 Yıl</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                  <span className="text-gray-500">geçen aya göre</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sales">Satışlar</TabsTrigger>
          <TabsTrigger value="products">Ürünler</TabsTrigger>
          <TabsTrigger value="themes">Temalar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aylık Satış Grafiği */}
            <Card>
              <CardHeader>
                <CardTitle>Aylık Satış Trendi</CardTitle>
                <CardDescription>Son 6 ayın satış performansı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(item.value / 8000) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">₺{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Son Siparişler */}
            <Card>
              <CardHeader>
                <CardTitle>Son Siparişler</CardTitle>
                <CardDescription>En son gelen siparişler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.product}</p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{order.amount}</p>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Günlük Satış</CardTitle>
                <CardDescription>Son 30 günün satış detayları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Satış grafiği burada görüntülenecek
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satış Özeti</CardTitle>
                <CardDescription>Seçilen dönem için özet bilgiler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Satış</span>
                  <span className="font-medium">₺26,750</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Sipariş</span>
                  <span className="font-medium">₺300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">En Yüksek Satış</span>
                  <span className="font-medium">₺1,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dönüşüm Oranı</span>
                  <span className="font-medium">3.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>En Çok Satan Ürünler</CardTitle>
              <CardDescription>Ürün satış performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(item.value / 40) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>En Popüler Temalar</CardTitle>
              <CardDescription>Tema kullanım istatistikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {themeData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(item.value / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
