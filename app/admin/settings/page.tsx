"use client"

import { useState } from "react"
import { Save, Bell, Shield, Database, Palette, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Settings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    address: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    orderNotifications: boolean
    stockAlerts: boolean
    newUserNotifications: boolean
  }
  payment: {
    paytrMerchantId: string
    paytrMerchantKey: string
    paytrMerchantSalt: string
    testMode: boolean
  }
  shipping: {
    freeShippingThreshold: number
    standardShippingCost: number
    expressShippingCost: number
    processingDays: number
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    general: {
      siteName: "NFC Bileklik",
      siteDescription: "Akıllı NFC bileklikler ile dijital dünyaya adım atın",
      contactEmail: "info@nfcbileklik.com",
      supportPhone: "+90 532 123 45 67",
      address: "İstanbul, Türkiye",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      stockAlerts: true,
      newUserNotifications: true,
    },
    payment: {
      paytrMerchantId: "",
      paytrMerchantKey: "",
      paytrMerchantSalt: "",
      testMode: true,
    },
    shipping: {
      freeShippingThreshold: 500,
      standardShippingCost: 25,
      expressShippingCost: 50,
      processingDays: 2,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // API call simulation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("Ayarlar başarıyla kaydedildi")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistem Ayarları</h1>
          <p className="text-gray-500">Uygulama ayarlarını yönetin</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="payment">Ödeme</TabsTrigger>
          <TabsTrigger value="shipping">Kargo</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Genel Ayarlar
              </CardTitle>
              <CardDescription>Site genel bilgileri ve iletişim ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, siteName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">İletişim E-postası</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, contactEmail: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, siteDescription: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Destek Telefonu</Label>
                  <Input
                    id="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, supportPhone: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={settings.general.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, address: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Ayarları
              </CardTitle>
              <CardDescription>Sistem bildirimlerini yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">E-posta Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Önemli olaylar için e-posta gönder</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailNotifications: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Acil durumlar için SMS gönder</p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsNotifications: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderNotifications">Sipariş Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Yeni siparişler için bildirim</p>
                </div>
                <Switch
                  id="orderNotifications"
                  checked={settings.notifications.orderNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, orderNotifications: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="stockAlerts">Stok Uyarıları</Label>
                  <p className="text-sm text-gray-500">Düşük stok durumunda uyar</p>
                </div>
                <Switch
                  id="stockAlerts"
                  checked={settings.notifications.stockAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, stockAlerts: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newUserNotifications">Yeni Kullanıcı Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Yeni kayıtlar için bildirim</p>
                </div>
                <Switch
                  id="newUserNotifications"
                  checked={settings.notifications.newUserNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, newUserNotifications: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                PayTR Ödeme Ayarları
              </CardTitle>
              <CardDescription>PayTR entegrasyon bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paytrMerchantId">Merchant ID</Label>
                <Input
                  id="paytrMerchantId"
                  value={settings.payment.paytrMerchantId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, paytrMerchantId: e.target.value },
                    })
                  }
                  placeholder="PayTR Merchant ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paytrMerchantKey">Merchant Key</Label>
                <Input
                  id="paytrMerchantKey"
                  type="password"
                  value={settings.payment.paytrMerchantKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, paytrMerchantKey: e.target.value },
                    })
                  }
                  placeholder="PayTR Merchant Key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paytrMerchantSalt">Merchant Salt</Label>
                <Input
                  id="paytrMerchantSalt"
                  type="password"
                  value={settings.payment.paytrMerchantSalt}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, paytrMerchantSalt: e.target.value },
                    })
                  }
                  placeholder="PayTR Merchant Salt"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="testMode">Test Modu</Label>
                  <p className="text-sm text-gray-500">Ödeme sistemini test modunda çalıştır</p>
                </div>
                <Switch
                  id="testMode"
                  checked={settings.payment.testMode}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, testMode: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kargo Ayarları</CardTitle>
              <CardDescription>Kargo ücretleri ve teslimat ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Ücretsiz Kargo Limiti (₺)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={settings.shipping.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shipping: { ...settings.shipping, freeShippingThreshold: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingDays">İşlem Süresi (Gün)</Label>
                  <Input
                    id="processingDays"
                    type="number"
                    value={settings.shipping.processingDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shipping: { ...settings.shipping, processingDays: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standardShippingCost">Standart Kargo Ücreti (₺)</Label>
                  <Input
                    id="standardShippingCost"
                    type="number"
                    value={settings.shipping.standardShippingCost}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shipping: { ...settings.shipping, standardShippingCost: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expressShippingCost">Hızlı Kargo Ücreti (₺)</Label>
                  <Input
                    id="expressShippingCost"
                    type="number"
                    value={settings.shipping.expressShippingCost}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        shipping: { ...settings.shipping, expressShippingCost: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Güvenlik Ayarları
              </CardTitle>
              <CardDescription>Sistem güvenlik politikaları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">İki Faktörlü Doğrulama</Label>
                  <p className="text-sm text-gray-500">Admin girişleri için 2FA zorunlu kıl</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorAuth: checked },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (dk)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Maksimum Giriş Denemesi</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, maxLoginAttempts: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Şifre Uzunluğu</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, passwordMinLength: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gelişmiş Ayarlar</CardTitle>
              <CardDescription>Sistem bakımı ve gelişmiş özellikler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  Veritabanı Yedekle
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Palette className="h-6 w-6 mb-2" />
                  Önbellek Temizle
                </Button>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Dikkat</h4>
                <p className="text-sm text-yellow-700">
                  Gelişmiş ayarları değiştirmeden önce sistem yedeği almanız önerilir.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
