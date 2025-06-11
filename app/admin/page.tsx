"use client"

import { useEffect, useState } from "react"
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
  BarChart3,
  Download,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/contexts/admin-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminStatistics() {
  const { state, fetchAdminStats } = useAdmin()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    } else if (state.isAuthenticated) {
      setIsLoading(false)
      // İstatistikleri yükle
      fetchAdminStats?.()
    }
  }, [state.isAuthenticated, state.isLoading, router, fetchAdminStats])

  console.log("Admin stats:", state.stats)
  console.log("Admin authenticated:", state.isAuthenticated)

  if (state.isLoading || isLoading) {
    return <StatisticsSkeleton />
  }

  if (!state.admin) {
    return null
  }

  // Eğer stats yoksa varsayılan değerler kullan
  const stats = state.stats || {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    activeNFCContent: 0,
    monthlyGrowth: 0,
    themeUsage: [],
    last7DaysOrders: [],
  }

  const statCards = [
    {
      title: "Toplam Kullanıcı",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Toplam Sipariş",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Toplam Gelir",
      value: `₺${stats.totalRevenue.toLocaleString("tr-TR")}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Aktif NFC İçerik",
      value: stats.activeNFCContent,
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "-3%",
      changeType: "negative",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İstatistikler</h1>
          <p className="text-gray-600">Detaylı analiz ve raporlar</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              console.log("Refreshing stats...")
              fetchAdminStats?.()
            }}
            variant="outline"
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change} geçen aya göre
                    </p>
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

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sales">Satışlar</TabsTrigger>
          <TabsTrigger value="products">Ürünler</TabsTrigger>
          <TabsTrigger value="themes">Temalar</TabsTrigger>
        </TabsList>

        {/* Genel Bakış Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sol Kolon - Sipariş Durumu */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Aylık Satış Trendi</CardTitle>
                  <CardDescription>Son 6 ayın satış performansı</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: "Ocak", amount: 4500, percentage: 60 },
                      { month: "Şubat", amount: 5200, percentage: 70 },
                      { month: "Mart", amount: 4800, percentage: 65 },
                      { month: "Nisan", amount: 6100, percentage: 82 },
                      { month: "Mayıs", amount: 5900, percentage: 79 },
                      { month: "Haziran", amount: 7200, percentage: 97 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium w-16">{item.month}</span>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="font-bold w-20 text-right">₺{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sağ Kolon - Son Siparişler */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Son Siparişler</CardTitle>
                  <CardDescription>En son gelen siparişler</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Ahmet Yılmaz", product: "Gümüş NFC Bileklik", amount: 299, status: "Tamamlandı" },
                      { name: "Ayşe Demir", product: "Altın NFC Bileklik", amount: 399, status: "Kargoya Verildi" },
                      { name: "Mehmet Kaya", product: "Siyah NFC Bileklik", amount: 249, status: "İşleniyor" },
                      { name: "Fatma Özkan", product: "Rose Gold NFC Bileklik", amount: 349, status: "Onay Bekliyor" },
                    ].map((order, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{order.name}</p>
                            <p className="text-xs text-gray-500">{order.product}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">₺{order.amount}</p>
                            <Badge
                              variant={
                                order.status === "Tamamlandı"
                                  ? "default"
                                  : order.status === "Kargoya Verildi"
                                    ? "secondary"
                                    : order.status === "İşleniyor"
                                      ? "outline"
                                      : "destructive"
                              }
                              className="text-xs"
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Satışlar Tab */}
        <TabsContent value="sales" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
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
                    <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                    <p className="text-sm text-gray-600">Bekleyen</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">
                      {stats.totalOrders - stats.deliveredOrders - stats.pendingOrders}
                    </p>
                    <p className="text-sm text-gray-600">İşleniyor</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
                    <p className="text-sm text-gray-600">Teslim Edildi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Günlük Satış Performansı</CardTitle>
                <CardDescription>Son 7 günün satış verileri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full bg-slate-50 rounded-md flex items-end justify-between p-2">
                  {stats.last7DaysOrders && stats.last7DaysOrders.length > 0 ? (
                    stats.last7DaysOrders.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-primary w-10 rounded-t-md"
                          style={{
                            height: `${Math.max(20, (day.order_count / Math.max(...stats.last7DaysOrders.map((d) => d.order_count))) * 150)}px`,
                          }}
                        ></div>
                        <span className="text-xs mt-1">
                          {new Date(day.order_date).toLocaleDateString("tr-TR", { day: "2-digit" })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BarChart3 className="h-16 w-16" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ürünler Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Ürün İstatistikleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Toplam Ürün:</span>
                    <Badge variant="outline">{stats.totalProducts}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>En Çok Satan Ürün:</span>
                    <Badge variant="secondary">NFC Bileklik Pro</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stok Durumu:</span>
                    <Badge className="bg-green-600">Yeterli</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <Badge variant="secondary">{stats.activeNFCContent}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NFC Aktiflik Oranı:</span>
                    <Badge className="bg-green-600">
                      %{Math.round((stats.activeNFCContent / Math.max(1, stats.totalOrders)) * 100)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Temalar Tab */}
        <TabsContent value="themes" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema Kullanım İstatistikleri</CardTitle>
              <CardDescription>En çok kullanılan temalar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.themeUsage && stats.themeUsage.length > 0 ? (
                  stats.themeUsage.map((theme, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{theme.theme_name}</span>
                        <span className="text-sm text-gray-500">{theme.usage_count} kullanım</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${Math.max(5, (theme.usage_count / Math.max(...stats.themeUsage.map((t) => t.usage_count))) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Henüz tema kullanım verisi bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatisticsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Tabs Skeleton */}
      <div>
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
