"use client"

import { Checkbox } from "@/components/ui/checkbox"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, Upload, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Image from "next/image"
import { categories } from "@/lib/categories"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory: string
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  images: string[]
  features: string[]
  specifications: { [key: string]: string }
  nfcEnabled: boolean
  createdAt: string
  updatedAt: string
}

// Mock data
const mockProduct: Product = {
  id: "product-1",
  name: "Gümüş NFC Bileklik",
  description:
    "Şık ve modern tasarımıyla öne çıkan gümüş NFC bileklik. Su geçirmez özelliği ile günlük kullanıma uygun.",
  price: 299,
  originalPrice: 399,
  category: "Bileklik",
  subcategory: "Gümüş",
  stock: 45,
  status: "active",
  nfcEnabled: true,
  images: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
  features: ["Su geçirmez", "NFC teknolojisi", "Ayarlanabilir boyut", "Dayanıklı malzeme"],
  specifications: {
    Malzeme: "Paslanmaz çelik",
    Boyut: "Ayarlanabilir (16-22 cm)",
    Ağırlık: "25g",
    "Su Geçirmezlik": "IP67",
    "NFC Chip": "NTAG213",
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product>(mockProduct)
  const [isEditing, setIsEditing] = useState(true) // Varsayılan olarak düzenleme modunda
  const [isSaving, setIsSaving] = useState(false)
  const [availableSubcategories, setAvailableSubcategories] = useState<{ id: string; name: string }[]>([])

  // Kategori değiştiğinde alt kategorileri güncelle
  useEffect(() => {
    const category = categories.find((c) => c.id.toLowerCase() === product.category.toLowerCase())
    if (category) {
      setAvailableSubcategories(category.subcategories)
    }
  }, [product.category])

  const handleSave = async () => {
    setIsSaving(true)
    // API call simulation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("Ürün bilgileri güncellendi")
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Handle image upload
      toast.success("Resim yüklendi")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif"
      case "inactive":
        return "Pasif"
      case "out_of_stock":
        return "Stokta Yok"
      default:
        return status
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
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-500">Ürün Detayları</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open(`/product/${product.id}`, "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            Önizle
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Ürün Bilgileri</TabsTrigger>
          <TabsTrigger value="images">Resimler</TabsTrigger>
          <TabsTrigger value="inventory">Stok & Fiyat</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>Ürünün temel özellikleri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  />
                </div>

                {/* Kategori Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="category">Ana Kategori</Label>
                  <Select
                    value={product.category.toLowerCase()}
                    onValueChange={(value) => setProduct({ ...product, category: value, subcategory: "" })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Alt Kategori Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Alt Kategori</Label>
                  <Select
                    value={product.subcategory.toLowerCase()}
                    onValueChange={(value) => setProduct({ ...product, subcategory: value })}
                    disabled={availableSubcategories.length === 0}
                  >
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder="Alt kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <Select
                    value={product.status}
                    onValueChange={(value: "active" | "inactive" | "out_of_stock") =>
                      setProduct({ ...product, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                      <SelectItem value="out_of_stock">Stokta Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nfc-enabled"
                    checked={product.nfcEnabled}
                    onCheckedChange={(checked) => setProduct({ ...product, nfcEnabled: checked === true })}
                  />
                  <label htmlFor="nfc-enabled" className="text-sm font-medium">
                    NFC Özelliği Aktif
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Durum ve İstatistikler */}
            <Card>
              <CardHeader>
                <CardTitle>Durum & İstatistikler</CardTitle>
                <CardDescription>Ürün durumu ve satış bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durum</span>
                  <Badge className={getStatusColor(product.status)}>{getStatusText(product.status)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stok</span>
                  <span className="font-medium">{product.stock} adet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fiyat</span>
                  <span className="font-medium">₺{product.price}</span>
                </div>
                {product.originalPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eski Fiyat</span>
                    <span className="font-medium line-through text-gray-500">₺{product.originalPrice}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Oluşturulma</span>
                  <span className="font-medium">{new Date(product.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Son Güncelleme</span>
                  <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Özellikler */}
          <Card>
            <CardHeader>
              <CardTitle>Ürün Özellikleri</CardTitle>
              <CardDescription>Ürünün öne çıkan özellikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...product.features]
                        newFeatures[index] = e.target.value
                        setProduct({ ...product, features: newFeatures })
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFeatures = product.features.filter((_, i) => i !== index)
                        setProduct({ ...product, features: newFeatures })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setProduct({ ...product, features: [...product.features, ""] })}
                >
                  Özellik Ekle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teknik Özellikler */}
          <Card>
            <CardHeader>
              <CardTitle>Teknik Özellikler</CardTitle>
              <CardDescription>Ürünün teknik detayları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4">
                    <Input
                      value={key}
                      onChange={(e) => {
                        const newSpecs = { ...product.specifications }
                        delete newSpecs[key]
                        newSpecs[e.target.value] = value
                        setProduct({ ...product, specifications: newSpecs })
                      }}
                      placeholder="Özellik adı"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={value}
                        onChange={(e) => {
                          const newSpecs = { ...product.specifications }
                          newSpecs[key] = e.target.value
                          setProduct({ ...product, specifications: newSpecs })
                        }}
                        placeholder="Değer"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSpecs = { ...product.specifications }
                          delete newSpecs[key]
                          setProduct({ ...product, specifications: newSpecs })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    setProduct({
                      ...product,
                      specifications: { ...product.specifications, "": "" },
                    })
                  }
                >
                  Özellik Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ürün Resimleri</CardTitle>
              <CardDescription>Ürünün görsel içerikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Ürün resmi ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newImages = product.images.filter((_, i) => i !== index)
                        setProduct({ ...product, images: newImages })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Resim yüklemek için tıklayın</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Resim Seç
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fiyatlandırma</CardTitle>
                <CardDescription>Ürün fiyat bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Satış Fiyatı (₺)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Eski Fiyat (₺)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={product.originalPrice || ""}
                    onChange={(e) => setProduct({ ...product, originalPrice: Number(e.target.value) || undefined })}
                    placeholder="İndirim varsa eski fiyatı girin"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stok Yönetimi</CardTitle>
                <CardDescription>Ürün stok bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Mevcut Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={product.stock}
                    onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Stok Durumu</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mevcut:</span>
                      <span className="font-medium">{product.stock} adet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durum:</span>
                      <Badge className={getStatusColor(product.status)}>{getStatusText(product.status)}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
              <CardDescription>Arama motoru optimizasyonu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Başlık</Label>
                <Input
                  id="seoTitle"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="Arama motorlarında görünecek başlık"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Açıklama</Label>
                <Textarea
                  id="seoDescription"
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  placeholder="Arama motorlarında görünecek açıklama"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Anahtar Kelimeler</Label>
                <Input id="seoKeywords" placeholder="nfc bileklik, akıllı bileklik, teknoloji" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
