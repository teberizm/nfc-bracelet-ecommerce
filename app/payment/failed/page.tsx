"use client"

import Link from "next/link"
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentFailedPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-red-800 mb-4">Ödeme Başarısız</h1>
          <p className="text-lg text-gray-600">Ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyiniz.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Olası Nedenler</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Kart bilgilerinde hata</li>
              <li>• Yetersiz bakiye</li>
              <li>• Banka tarafından işlem reddedildi</li>
              <li>• İnternet bağlantısı sorunu</li>
              <li>• İşlem zaman aşımına uğradı</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button asChild size="lg">
            <Link href="/checkout">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Link>
          </Button>
          <div>
            <Button variant="outline" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sepete Dön
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
