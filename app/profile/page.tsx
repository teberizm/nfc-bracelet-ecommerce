"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Settings,
  LogOut,
  Edit,
  Save,
  X,
  Upload,
  Zap,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Eye,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth, type User as AuthUser } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { state, dispatch, logout } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<AuthUser | null>(null)
  const [nfcStates, setNfcStates] = useState<
    Record<
      string,
      {
        contentUploaded: boolean
        themeSelected: boolean
        useSameContent: boolean
      }
    >
  >({})

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  useEffect(() => {
    if (state.user) {
      setEditedUser(state.user)
    }
  }, [state.user])

  if (state.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  if (!state.user) {
    return null
  }

  const handleSaveProfile = () => {
    if (editedUser) {
      dispatch({ type: "UPDATE_PROFILE", payload: editedUser })
      localStorage.setItem("user", JSON.stringify(editedUser))
      setIsEditing(false)
      toast({
        title: "Profil Güncellendi",
        description: "Bilgileriniz başarıyla güncellendi.",
      })
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    })
    router.push("/")
  }

  const handleUseSameContent = (itemKey: string, checked: boolean) => {
    setNfcStates((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        useSameContent: checked,
        contentUploaded: checked ? true : prev[itemKey]?.contentUploaded || false,
        themeSelected: checked ? true : prev[itemKey]?.themeSelected || false,
      },
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "processing":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-600" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelled":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Beklemede"
      case "processing":
        return "İşleniyor"
      case "shipped":
        return "Kargoda"
      case "delivered":
        return "Teslim Edildi"
      case "cancelled":
        return "İptal Edildi"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Siparişleri ayrıştır - her ürünü quantity kadar tekrarla
  const expandOrderItems = (order: any) => {
    const expandedItems: any[] = []

    order.items.forEach((item: any, itemIndex: number) => {
      for (let i = 0; i < item.quantity; i++) {
        expandedItems.push({
          ...item,
          quantity: 1,
          itemIndex: `${order.id}-${itemIndex}-${i}`,
          displayName: item.quantity > 1 ? `${item.productName} - ${i + 1}. Bileklik` : item.productName,
          isMultiple: item.quantity > 1,
          currentIndex: i,
          totalCount: item.quantity,
        })
      }
    })

    return expandedItems
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-lg">
                {state.user?.firstName?.[0] || "U"}
                {state.user?.lastName?.[0] || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {state.user?.firstName || "Kullanıcı"} {state.user?.lastName || ""}
              </h1>
              <p className="text-gray-600">{state.user?.email || ""}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil Bilgileri</TabsTrigger>
            <TabsTrigger value="orders">Siparişlerim ({state.orders.length})</TabsTrigger>
            <TabsTrigger value="nfc">NFC Yönetimi</TabsTrigger>
          </TabsList>

          {/* Profil Bilgileri */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profil Bilgileri</CardTitle>
                    <CardDescription>Kişisel bilgilerinizi görüntüleyin ve düzenleyin</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        İptal
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="firstName"
                        value={editedUser?.firstName || ""}
                        onChange={(e) =>
                          setEditedUser((prev) => (prev ? { ...prev, firstName: e.target.value } : null))
                        }
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="lastName"
                        value={editedUser?.lastName || ""}
                        onChange={(e) => setEditedUser((prev) => (prev ? { ...prev, lastName: e.target.value } : null))}
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={editedUser?.email || ""}
                      onChange={(e) => setEditedUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      value={editedUser?.phone || ""}
                      onChange={(e) => setEditedUser((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Adres Bilgileri */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Adres Bilgileri
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Adres</Label>
                      <Input
                        id="street"
                        value={editedUser?.address?.street || ""}
                        onChange={(e) =>
                          setEditedUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  address: { ...prev.address, street: e.target.value } as any,
                                }
                              : null,
                          )
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Şehir</Label>
                      <Input
                        id="city"
                        value={editedUser?.address?.city || ""}
                        onChange={(e) =>
                          setEditedUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  address: { ...prev.address, city: e.target.value } as any,
                                }
                              : null,
                          )
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Posta Kodu</Label>
                      <Input
                        id="zipCode"
                        value={editedUser?.address?.zipCode || ""}
                        onChange={(e) =>
                          setEditedUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  address: { ...prev.address, zipCode: e.target.value } as any,
                                }
                              : null,
                          )
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Ülke</Label>
                      <Input
                        id="country"
                        value={editedUser?.address?.country || ""}
                        onChange={(e) =>
                          setEditedUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  address: { ...prev.address, country: e.target.value } as any,
                                }
                              : null,
                          )
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Siparişler */}
          <TabsContent value="orders">
            <div className="space-y-6">
              {state.orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Henüz siparişiniz yok</h3>
                    <p className="text-gray-600 mb-6">İlk siparişinizi vererek NFC bileklik deneyimini yaşayın!</p>
                    <Button asChild>
                      <Link href="/products">Alışverişe Başla</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                state.orders.map((order) => {
                  const expandedItems = expandOrderItems(order)

                  return (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Sipariş #{order.id}</CardTitle>
                            <CardDescription>
                              {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(order.status)}
                              <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                            </div>
                            <p className="text-lg font-bold">₺{order.total.toLocaleString("tr-TR")}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Ayrıştırılmış Ürünler */}
                          <div className="space-y-3">
                            {expandedItems.map((item, index) => {
                              const itemKey = item.itemIndex
                              const currentNfcState = nfcStates[itemKey] || {
                                contentUploaded: false,
                                themeSelected: false,
                                useSameContent: false,
                              }

                              // İlk item mi kontrol et (aynı üründen)
                              const isFirstOfMultiple = item.isMultiple && item.currentIndex === 0
                              const isSecondaryOfMultiple = item.isMultiple && item.currentIndex > 0
                              const firstItemKey = item.isMultiple
                                ? `${order.id}-${item.itemIndex.split("-")[1]}-0`
                                : null
                              const firstItemState = firstItemKey ? nfcStates[firstItemKey] : null

                              return (
                                <div key={itemKey}>
                                  <div
                                    className={`flex items-center gap-4 p-3 rounded-lg ${
                                      isFirstOfMultiple
                                        ? "bg-blue-50 border-l-4 border-blue-500"
                                        : isSecondaryOfMultiple
                                          ? "bg-gray-50 border-l-4 border-gray-300"
                                          : "bg-gray-50"
                                    }`}
                                  >
                                    <Image
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.displayName}
                                      width={60}
                                      height={60}
                                      className="rounded-md object-cover"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-medium">{item.displayName}</h4>
                                      <p className="text-sm text-gray-600">
                                        1 adet × ₺{item.price.toLocaleString("tr-TR")}
                                      </p>
                                      {item.nfcEnabled && (
                                        <Badge variant="secondary" className="mt-1">
                                          <Zap className="h-3 w-3 mr-1" />
                                          NFC Özellikli
                                        </Badge>
                                      )}
                                      {isFirstOfMultiple && (
                                        <Badge variant="outline" className="mt-1 ml-2">
                                          Ana Bileklik
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">₺{item.price.toLocaleString("tr-TR")}</p>
                                    </div>
                                  </div>

                                  {/* NFC Yönetim Butonları */}
                                  {item.nfcEnabled && order.status === "delivered" && (
                                    <div className="ml-16 mt-3 space-y-3">
                                      {/* İkinci ve sonraki itemlar için "Aynı içeriği kullan" seçeneği */}
                                      {isSecondaryOfMultiple && firstItemState?.contentUploaded && (
                                        <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border">
                                          <Checkbox
                                            id={`same-content-${itemKey}`}
                                            checked={currentNfcState.useSameContent}
                                            onCheckedChange={(checked) =>
                                              handleUseSameContent(itemKey, checked as boolean)
                                            }
                                          />
                                          <Label htmlFor={`same-content-${itemKey}`} className="text-sm font-medium">
                                            <Copy className="h-4 w-4 inline mr-1" />
                                            Ana bileğin aynı içeriğini ve temasını kullan
                                          </Label>
                                        </div>
                                      )}

                                      {/* Butonlar */}
                                      <div className="flex gap-2">
                                        <Button
                                          variant={currentNfcState.contentUploaded ? "secondary" : "default"}
                                          size="sm"
                                          asChild={!currentNfcState.contentUploaded && !currentNfcState.useSameContent}
                                          disabled={currentNfcState.contentUploaded || currentNfcState.useSameContent}
                                        >
                                          {currentNfcState.contentUploaded || currentNfcState.useSameContent ? (
                                            <>
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              İçerik Hazır
                                            </>
                                          ) : (
                                            <Link href={`/order/${order.id}/content?item=${itemKey}`}>
                                              <Upload className="h-4 w-4 mr-2" />
                                              İçini Doldur
                                            </Link>
                                          )}
                                        </Button>

                                        <Button
                                          variant={currentNfcState.themeSelected ? "secondary" : "outline"}
                                          size="sm"
                                          asChild={
                                            (currentNfcState.contentUploaded || currentNfcState.useSameContent) &&
                                            !currentNfcState.themeSelected
                                          }
                                          disabled={
                                            (!currentNfcState.contentUploaded && !currentNfcState.useSameContent) ||
                                            currentNfcState.themeSelected
                                          }
                                        >
                                          {currentNfcState.themeSelected ? (
                                            <>
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Tema Hazır
                                            </>
                                          ) : currentNfcState.contentUploaded || currentNfcState.useSameContent ? (
                                            <Link href={`/order/${order.id}/theme?item=${itemKey}`}>
                                              <Settings className="h-4 w-4 mr-2" />
                                              Tema Seç ve Düzenle
                                            </Link>
                                          ) : (
                                            <>
                                              <Settings className="h-4 w-4 mr-2" />
                                              Tema Seç ve Düzenle
                                            </>
                                          )}
                                        </Button>

                                        {(currentNfcState.contentUploaded || currentNfcState.useSameContent) &&
                                          currentNfcState.themeSelected && (
                                            <Button variant="outline" size="sm" asChild>
                                              <Link href={`/order/${order.id}/preview?item=${itemKey}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Görüntüle
                                              </Link>
                                            </Button>
                                          )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* NFC Yönetimi */}
          <TabsContent value="nfc">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  NFC Yönetimi
                </CardTitle>
                <CardDescription>NFC özellikli ürünlerinizi yönetin ve içeriklerinizi düzenleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p>NFC yönetim özellikleri yakında eklenecek...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
