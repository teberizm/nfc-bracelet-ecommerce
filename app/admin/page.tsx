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
  Settings,
  BarChart3,
  PieChart,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/contexts/admin-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboard() {
  const { state } = useAdmin()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    } else if (state.isAuthenticated) {
      setIsLoading(false)
    }
  }, [state.isAuthenticated, state.isLoading, router])

  if (state.isLoading || isLoading) {
    return <DashboardSkeleton />
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
            <Card key={index} className="border-l-4 border-l-primary">
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

      {/* Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Siparişler</TabsTrigger>
          <TabsTrigger value="products">Ürünler & NFC</TabsTrigger>
          <TabsTrigger value="themes">Temalar</TabsTrigger>
        </TabsList>

        {/* Siparişler Tab */}
        <TabsContent value="orders" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sol Kolon - Sipariş Durumu */}
            <div className="lg:col-span-2">
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

                  <div className="mt-8">
                    <h4 className="text-sm font-medium mb-3">Son 7 Gün Sipariş Trendi</h4>
                    <div className="h-[200px] w-full bg-slate-50 rounded-md flex items-end justify-between p-2">
                      {state.stats.last7DaysOrders?.map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-primary w-10 rounded-t-md"
                            style={{
                              height: `${Math.max(20, (day.order_count / Math.max(...state.stats.last7DaysOrders.map((d) => d.order_count))) * 150)}px`,
                            }}
                          ></div>
                          <span className="text-xs mt-1">
                            {new Date(day.order_date).toLocaleDateString("tr-TR", { day: "2-digit" })}
                          </span>
                        </div>
                      ))}
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
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/admin/users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Kullanıcı Yönetimi
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/admin/products")}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Ürün Yönetimi
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/admin/orders")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sipariş Yönetimi
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/admin/nfc-content")}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    NFC İçerik Yönetimi
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/admin/themes")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Tema Yönetimi
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/admin/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Sistem Ayarları
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Ürünler & NFC Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ürün İstatistikleri */}
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
                    <Badge variant="outline">{state.stats.totalProducts}</Badge>
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

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Ürün Kategorileri</h4>
                  <div className="h-[150px] w-full bg-slate-50 rounded-md p-4 flex items-center justify-center">
                    <PieChart className="h-24 w-24 text-primary opacity-70" />
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
                      %{Math.round((state.stats.activeNFCContent / Math.max(1, state.stats.totalOrders)) * 100)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">NFC İçerik Kullanımı</h4>
                  <div className="h-[150px] w-full bg-slate-50 rounded-md p-4 flex items-center justify-center">
                    <BarChart3 className="h-24 w-24 text-primary opacity-70" />
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
                {state.stats.themeUsage?.map((theme, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{theme.theme_name}</span>
                      <span className="text-sm text-gray-500">{theme.usage_count} kullanım</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{
                          width: `${Math.max(5, (theme.usage_count / Math.max(...state.stats.themeUsage.map((t) => t.usage_count))) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}

                {(!state.stats.themeUsage || state.stats.themeUsage.length === 0) && (
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

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
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
                <div className="grid grid-cols-3 gap-6">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
                        <Skeleton className="h-6 w-12 mx-auto mb-1" />
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </div>
                    ))}
                </div>

                <div className="mt-8">
                  <Skeleton className="h-4 w-40 mb-3" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
