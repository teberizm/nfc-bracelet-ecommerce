"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CreditCard, Shield, Truck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { createPayTRToken, redirectToPayTR } from "@/lib/paytr"
import { toast } from "@/hooks/use-toast"
import { turkeyCities, getDistrictsByCity, type District } from "@/lib/turkey-cities"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CheckoutPage() {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: authState } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCity, setSelectedCity] = useState<number | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null)
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([])
  const [shippingInfo, setShippingInfo] = useState({
    firstName: authState.user?.firstName || "",
    lastName: authState.user?.lastName || "",
    email: authState.user?.email || "",
    phone: authState.user?.phone || "",
    city: "",
    district: "",
    address: authState.user?.address?.street || "",
  })

  useEffect(() => {
    if (cartState.items.length === 0) {
      router.push("/cart")
    }
  }, [cartState.items.length, router])

  useEffect(() => {
    if (selectedCity) {
      const districts = getDistrictsByCity(selectedCity)
      setAvailableDistricts(districts)
      setSelectedDistrict(null)
      setShippingInfo((prev) => ({ ...prev, district: "" }))
    }
  }, [selectedCity])

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleCityChange = (cityId: string) => {
    const id = Number.parseInt(cityId)
    setSelectedCity(id)
    const city = turkeyCities.find((c) => c.id === id)
    if (city) {
      setShippingInfo((prev) => ({ ...prev, city: city.name }))
    }
  }

  const handleDistrictChange = (districtId: string) => {
    const id = Number.parseInt(districtId)
    setSelectedDistrict(id)
    const district = availableDistricts.find((d) => d.id === id)
    if (district) {
      setShippingInfo((prev) => ({ ...prev, district: district.name }))
    }
  }

  const validateForm = () => {
    const required = ["firstName", "lastName", "email", "phone", "city", "district", "address"]
    for (const field of required) {
      if (!shippingInfo[field as keyof typeof shippingInfo]?.trim()) {
        toast({
          title: "Eksik Bilgi",
          description: `Lütfen ${field === "district" ? "ilçe" : field === "city" ? "şehir" : field} alanını doldurun.`,
          variant: "destructive",
        })
        return false
      }
    }

    if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Kullanıcının IP adresini al (gerçek uygulamada backend'den alınacak)
      const userIP = "127.0.0.1" // Demo için

      // PayTR token oluştur
      const paymentResult = await createPayTRToken({
        orderId: `order_${Date.now()}`,
        amount: cartState.total,
        userEmail: shippingInfo.email,
        userName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        userPhone: shippingInfo.phone,
        userAddress: `${shippingInfo.address}, ${shippingInfo.district}, ${shippingInfo.city}`,
        userIP: userIP,
        items: cartState.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })

      if (paymentResult.status === "success" && paymentResult.token) {
        // PayTR ödeme sayfasına yönlendir
        redirectToPayTR(paymentResult.token)
      } else {
        throw new Error(paymentResult.reason || "Ödeme hatası")
      }
    } catch (error) {
      console.error("Ödeme hatası:", error)
      toast({
        title: "Ödeme Hatası",
        description: "Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartState.items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sepete Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ödeme</h1>
            <p className="text-gray-600">Siparişinizi tamamlayın</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Teslimat Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teslimat Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Teslimat Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad *</Label>
                    <Input
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad *</Label>
                    <Input
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir *</Label>
                    <Select onValueChange={handleCityChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Şehir seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {turkeyCities.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">İlçe *</Label>
                    <Select onValueChange={handleDistrictChange} disabled={!selectedCity}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCity ? "İlçe seçin" : "Önce şehir seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map((district) => (
                          <SelectItem key={district.id} value={district.id.toString()}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                    placeholder="Mahalle, sokak, kapı no vb."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ödeme Yöntemi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Ödeme Yöntemi
                </CardTitle>
                <CardDescription>
                  PayTR güvenli ödeme sistemi ile kredi kartı, banka kartı ve diğer ödeme yöntemleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">PayTR Güvenli Ödeme</p>
                    <p className="text-sm text-gray-600">
                      Kredi kartı, banka kartı, havale/EFT ve diğer ödeme seçenekleri
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Taraf - Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Sipariş Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ürünler */}
                  <div className="space-y-3">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            {item.quantity} adet × ₺{item.price.toLocaleString("tr-TR")}
                          </p>
                        </div>
                        <p className="font-medium">₺{(item.price * item.quantity).toLocaleString("tr-TR")}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Fiyat Detayları */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ara Toplam:</span>
                      <span>₺{cartState.total.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kargo:</span>
                      <span className="text-green-600">Ücretsiz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KDV:</span>
                      <span>Dahil</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span className="text-blue-600">₺{cartState.total.toLocaleString("tr-TR")}</span>
                  </div>

                  {/* Ödeme Butonu */}
                  <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Ödemeyi Tamamla
                      </>
                    )}
                  </Button>

                  {/* Güvenlik Bilgileri */}
                  <div className="text-center pt-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      <span>256-bit SSL ile güvenli ödeme</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
