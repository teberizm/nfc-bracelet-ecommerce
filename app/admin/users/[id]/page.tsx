"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, MessageCircle, Package, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  lastLogin?: string
  status: "active" | "inactive" | "banned"
  totalOrders: number
  totalSpent: number
  notes?: string
}

interface Order {
  id: string
  date: string
  status: string
  total: number
  products: string[]
}

// Mock data
const mockUser: User = {
  id: "user-1",
  name: "Ahmet Yılmaz",
  email: "ahmet@example.com",
  phone: "+90 532 123 45 67",
  createdAt: "2024-01-15T10:30:00Z",
  lastLogin: "2024-01-20T14:22:00Z",
  status: "active",
  totalOrders: 3,
  totalSpent: 1200,
  notes: "VIP müşteri, hızlı teslimat tercih ediyor.",
}

const mockOrders: Order[] = [
  {
    id: "order-1",
    date: "2024-01-20",
    status: "Tamamlandı",
    total: 450,
    products: ["Gümüş NFC Bileklik", "Aşk Teması"],
  },
  {
    id: "order-2",
    date: "2024-01-18",
    status: "Kargoya Verildi",
    total: 350,
    products: ["Siyah NFC Bileklik"],
  },
  {
    id: "order-3",
    date: "2024-01-15",
    status: "Tamamlandı",
    total: 400,
    products: ["Altın NFC Bileklik", "Adventure Teması"],
  },
]

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User>(mockUser)
  const [orders] = useState<Order[]>(mockOrders)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // API call simulation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
    toast.success("Kullanıcı bilgileri güncellendi")
  }

  const handleWhatsApp = () => {
    const message = `Merhaba ${user.name}, NFC Bileklik ekibinden size ulaşıyoruz.`
    const whatsappUrl = `https://wa.me/${user.phone.replace(/\s/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "banned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrderStatusColor = (status: string) => {
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">Kullanıcı Detayları</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleWhatsApp}>
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Kullanıcı Bilgileri</TabsTrigger>
          <TabsTrigger value="orders">Siparişler ({orders.length})</TabsTrigger>
          <TabsTrigger value="activity">Aktivite</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>Kullanıcının kişisel bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <select
                    id="status"
                    value={user.status}
                    onChange={(e) => setUser({ ...user, status: e.target.value as any })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="banned">Yasaklı</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* İstatistikler */}
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
                <CardDescription>Kullanıcı aktivite özeti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durum</span>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === "active" ? "Aktif" : user.status === "inactive" ? "Pasif" : "Yasaklı"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Sipariş</span>
                  <span className="font-medium">{user.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Harcama</span>
                  <span className="font-medium">₺{user.totalSpent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kayıt Tarihi</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Son Giriş</span>
                  <span className="font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("tr-TR") : "Hiç"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notlar */}
          <Card>
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
              <CardDescription>Bu kullanıcı hakkında özel notlar</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={user.notes || ""}
                onChange={(e) => setUser({ ...user, notes: e.target.value })}
                disabled={!isEditing}
                placeholder="Kullanıcı hakkında notlar ekleyin..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Geçmişi</CardTitle>
              <CardDescription>Kullanıcının tüm siparişleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">#{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                        <p className="text-sm text-gray-600">{order.products.join(", ")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                      <p className="text-lg font-bold mt-1">₺{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktivite Geçmişi</CardTitle>
              <CardDescription>Kullanıcının son aktiviteleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Ödeme tamamlandı</p>
                    <p className="text-sm text-gray-500">20 Ocak 2024, 14:22</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Sipariş oluşturuldu</p>
                    <p className="text-sm text-gray-500">20 Ocak 2024, 14:20</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Hesap oluşturuldu</p>
                    <p className="text-sm text-gray-500">15 Ocak 2024, 10:30</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
