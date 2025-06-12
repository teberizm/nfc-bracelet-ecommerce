"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Wand2, Upload, ArrowRight, Loader2 } from "lucide-react"

export default function CustomDesignPage() {
  const { state } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [formData, setFormData] = useState({
    productType: "",
    material: "",
    description: "",
    file: null as File | null,
  })

  // Client-side mounting kontrolü
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        console.error("Kategori çekme hatası", err)
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Kullanıcı giriş kontrolü - sadece client-side'da
  useEffect(() => {
    if (isClient && !state.isAuthenticated) {
      router.push("/login?redirect=/custom-design")
    }
  }, [isClient, state.isAuthenticated, router])

  // Server-side rendering sırasında loading göster
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Kullanıcı giriş yapmamışsa loading göster
  if (!state.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validasyonu
    if (!formData.productType || !formData.material || !formData.description || !formData.file) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun ve bir görsel yükleyin.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Normalde burada bir API çağrısı yapılır
    // Şimdilik simüle ediyoruz
    setTimeout(() => {
      toast({
        title: "Tasarım Talebiniz Alındı!",
        description: "Ekibimiz en kısa sürede size özel teklifle dönüş yapacaktır.",
      })
      setIsSubmitting(false)
      router.push("/profile")
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
            <Wand2 className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Kendin Tasarla</h1>
          <p className="text-gray-600 text-lg">Hayalinizdeki takıyı birlikte tasarlayalım!</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nasıl Çalışır?</CardTitle>
            <CardDescription>Özel tasarım sürecimiz 3 basit adımda ilerler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-medium mb-1">Formu Doldurun</h3>
                <p className="text-sm text-gray-600">İstediğiniz ürün tipini, malzemeyi seçin ve görseli yükleyin</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-medium mb-1">Teklif Alın</h3>
                <p className="text-sm text-gray-600">Tasarımcılarımız size özel fiyat teklifi hazırlasın</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-medium mb-1">Siparişi Onaylayın</h3>
                <p className="text-sm text-gray-600">Teklifinizi onaylayın ve özel tasarımınız üretilsin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasarım Bilgileri</CardTitle>
            <CardDescription>
              Kız arkadaşının gözünü bileklik mi yapmak istiyorsun? Bize görseli gönder, sana nasıl olacağını ve fiyat
              teklifimizi verelim!
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productType">Ürün Tipi</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => setFormData({ ...formData, productType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ürün tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yükleniyor...
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material">Malzeme</Label>
                  <Select
                    value={formData.material}
                    onValueChange={(value) => setFormData({ ...formData, material: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Malzeme seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Altın</SelectItem>
                      <SelectItem value="silver">Gümüş</SelectItem>
                      <SelectItem value="steel">Paslanmaz Çelik</SelectItem>
                      <SelectItem value="leather">Deri</SelectItem>
                      <SelectItem value="silicone">Silikon</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tasarım Açıklaması</Label>
                <Textarea
                  id="description"
                  placeholder="Tasarımınızı detaylı bir şekilde anlatın..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Görsel Yükle</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input id="file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <Label htmlFor="file" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {formData.file ? formData.file.name : "Görsel seçmek için tıklayın"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max. 10MB)</span>
                    </div>
                  </Label>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    Tasarım Talebini Gönder
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
