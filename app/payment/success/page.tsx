"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle, Package, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

export default function PaymentSuccessPage() {
  const { dispatch: cartDispatch } = useCart()
  const { state: authState, dispatch: authDispatch } = useAuth()

  useEffect(() => {
    // Sepeti temizle
    cartDispatch({ type: "CLEAR_CART" })

    // Yeni sipariş oluştur (gerçek uygulamada backend'den gelecek)
    const newOrder = {
      id: `order_${Date.now()}`,
      userId: authState.user?.id || "",
      items: [], // Sepetten alınacak
      total: 0, // Hesaplanacak
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Türkiye",
      },
      nfcContentUploaded: false,
      themeSelected: false,
    }

    // Siparişi kullanıcının siparişlerine ekle
    if (authState.user) {
      authDispatch({ type: "ADD_ORDER", payload: newOrder })
    }
  }, [cartDispatch, authDispatch, authState.user])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">Ödeme Başarılı!</h1>
          <p className="text-lg text-gray-600">
            Siparişiniz başarıyla alındı. Kısa süre içinde kargo bilgilerinizi e-posta ile göndereceğiz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sipariş Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Siparişiniz hazırlanıyor. 1-3 iş günü içinde kargoya verilecek.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                NFC İçerik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Ürününüz elinize ulaştıktan sonra NFC içeriğinizi yükleyebilirsiniz.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Button asChild size="lg">
            <Link href="/profile">Siparişlerimi Görüntüle</Link>
          </Button>
          <div>
            <Button variant="outline" asChild>
              <Link href="/products">Alışverişe Devam Et</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
