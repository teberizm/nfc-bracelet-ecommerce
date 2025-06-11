"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, Plus, X, RefreshCw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface ProductFeature {
  id?: string
  feature_name: string
  feature_value: string
  sort_order: number
}

interface ProductSpecification {
  id?: string
  spec_name: string
  spec_value: string
  sort_order: number
}

interface ProductImage {
  id?: string
  image_url: string
  alt_text: string
  sort_order: number
  is_primary: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  original_price?: number | null
  stock: number
  category_id: string
  nfc_enabled: boolean
  is_active: boolean
  weight: string
  dimensions: string
  material: string
  featured: boolean
  meta_title?: string | null
  meta_description?: string | null
  features: ProductFeature[]
  specifications: ProductSpecification[]
  images: ProductImage[]
}

const categories = [
  { id: "1", name: "NFC Bileklik" },
  { id: "2", name: "Akıllı Bileklik" },
  { id: "3", name: "Özel Tasarım" },
  { id: "4", name: "Aksesuar" },
]

export default function AdminProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  // Mock data for development - replace with real API calls
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock product data
        const mockProduct: Product = {
          id: params.id as string,
          name: "NFC Aşk Bilekliği",
          slug: "nfc-ask-bilekligi",
          description:
            "Sevdiklerinizle özel anılarınızı paylaşabileceğiniz NFC teknolojili bileklik. Telefonunuzu yaklaştırarak fotoğraf, video, müzik ve mesajlarınızı anında paylaşabilirsiniz.",
          short_description: "NFC teknolojili özel tasarım bileklik",
          price: 299.99,
          original_price: 399.99,
          stock: 50,
          category_id: "1",
          nfc_enabled: true,
          is_active: true,
          weight: "25g",
          dimensions: "20cm x 1.5cm",
          material: "Silikon + NFC Chip",
          featured: true,
          meta_title: "NFC Aşk Bilekliği - Özel Anılarınızı Paylaşın",
          meta_description:
            "NFC teknolojili bileklik ile sevdiklerinizle özel anılarınızı paylaşın. Fotoğraf, video, müzik ve mesajlarınızı anında aktarın.",
          features: [
            { id: "1", feature_name: "NFC Teknolojisi", feature_value: "13.56 MHz", sort_order: 0 },
            { id: "2", feature_name: "Su Geçirmez", feature_value: "IP67", sort_order: 1 },
            { id: "3", feature_name: "Batarya", feature_value: "Gereksiz", sort_order: 2 },
          ],
          specifications: [
            { id: "1", spec_name: "Boyut", spec_value: "20cm x 1.5cm", sort_order: 0 },
            { id: "2", spec_name: "Ağırlık", spec_value: "25g", sort_order: 1 },
            { id: "3", spec_name: "Malzeme", spec_value: "Silikon + NFC Chip", sort_order: 2 },
            { id: "4", spec_name: "Renk", spec_value: "Siyah, Beyaz, Kırmızı", sort_order: 3 },
          ],
          images: [
            {
              id: "1",
              image_url: "/placeholder.svg?height=400&width=400&text=Ana+Resim",
              alt_text: "NFC Aşk Bilekliği Ana Resim",
              sort_order: 0,
              is_primary: true,
            },
            {
              id: "2",
              image_url: "/placeholder.svg?height=400&width=400&text=Yan+Görünüm",
              alt_text: "NFC Aşk Bilekliği Yan Görünüm",
              sort_order: 1,
              is_primary: false,
            },
          ],
        }

        setProduct(mockProduct)
      } catch (err) {
        setError("Ürün yüklenirken bir hata oluştu")
        console.error("Error loading product:", err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  const handleSave = async () => {
    if (!product) return

    try {
      setSaving(true)

      // Validate required fields
      if (!product.name.trim()) {
        toast.error("Ürün adı zorunludur")
        return
      }

      if (!product.slug.trim()) {
        toast.error("Ürün slug'ı zorunludur")
        return
      }

      if (!product.price || product.price <= 0) {
        toast.error("Geçerli bir fiyat giriniz")
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Saving product:", product)
      toast.success("Ürün başarıyla güncellendi")
    } catch (err) {
      console.error("Error saving product:", err)
      toast.error("Ürün güncellenirken bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return

    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Ürün başarıyla silindi")
      router.push("/admin/products")
    } catch (err) {
      console.error("Error deleting product:", err)
      toast.error("Ürün silinirken bir hata oluştu")
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  }

  const handleNameChange = (name: string) => {
    if (!product) return
    setProduct({
      ...product,
      name,
      slug: generateSlug(name),
    })
  }

  const addFeature = () => {
    if (!product) return
    const newFeatures = [
      ...product.features,
      {
        feature_name: "",
        feature_value: "",
        sort_order: product.features.length,
      },
    ]
    setProduct({ ...product, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    if (!product) return
    const newFeatures = product.features.filter((_, i) => i !== index)
    setProduct({ ...product, features: newFeatures })
  }

  const updateFeature = (index: number, field: keyof ProductFeature, value: string | number) => {
    if (!product) return
    const newFeatures = [...product.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setProduct({ ...product, features: newFeatures })
  }

  const addSpecification = () => {
    if (!product) return
    const newSpecs = [
      ...product.specifications,
      {
        spec_name: "",
        spec_value: "",
        sort_order: product.specifications.length,
      },
    ]
    setProduct({ ...product, specifications: newSpecs })
  }

  const removeSpecification = (index: number) => {
    if (!product) return
    const newSpecs = product.specifications.filter((_, i) => i !== index)
    setProduct({ ...product, specifications: newSpecs })
  }

  const updateSpecification = (index: number, field: keyof ProductSpecification, value: string | number) => {
    if (!product) return
    const newSpecs = [...product.specifications]
    newSpecs[index] = { ...newSpecs[index], [field]: value }
    setProduct({ ...product, specifications: newSpecs })
  }

  const addImage = () => {
    if (!product) return
    const newImages = [
      ...product.images,
      {
        image_url: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent("Yeni Resim")}`,
        alt_text: product.name,
        sort_order: product.images.length,
        is_primary: product.images.length === 0,
      },
    ]
    setProduct({ ...product, images: newImages })
  }

  const removeImage = (index: number) => {
    if (!product) return
    const newImages = product.images.filter((_, i) => i !== index)
    if (product.images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true
    }
    setProduct({ ...product, images: newImages })
  }

  const setPrimaryImage = (index: number) => {
    if (!product) return
    const newImages = product.images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }))
    setProduct({ ...product, images: newImages })
  }

  const updateImage = (index: number, field: keyof ProductImage, value: string | number | boolean) => {
    if (!product) return
    const newImages = [...product.images]
    newImages[index] = { ...newImages[index], [field]: value }
    setProduct({ ...product, images: newImages })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Ürün yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-yellow-500 text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-600 mb-4">İstediğiniz ürün bulunamadı.</p>
            <Button onClick={() => router.push("/admin/products")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ürünlere Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-500">Ürün Düzenleme</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open(`/product/${product.id}`, "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            Önizle
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Temel Bilgiler</TabsTrigger>
          <TabsTrigger value="images">Resimler</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
          <TabsTrigger value="inventory">Stok & Fiyat</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>Ürünün temel özellikleri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ürün adını girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={product.slug}
                    onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                    placeholder="url-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={product.category_id}
                    onValueChange={(value) => setProduct({ ...product, category_id: value })}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="material">Malzeme</Label>
                  <Input
                    id="material"
                    value={product.material}
                    onChange={(e) => setProduct({ ...product, material: e.target.value })}
                    placeholder="Ürün malzemesi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Boyutlar</Label>
                  <Input
                    id="dimensions"
                    value={product.dimensions}
                    onChange={(e) => setProduct({ ...product, dimensions: e.target.value })}
                    placeholder="Ürün boyutları"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Ağırlık</Label>
                  <Input
                    id="weight"
                    value={product.weight}
                    onChange={(e) => setProduct({ ...product, weight: e.target.value })}
                    placeholder="Ürün ağırlığı"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nfc-enabled"
                      checked={product.nfc_enabled}
                      onCheckedChange={(checked) => setProduct({ ...product, nfc_enabled: checked === true })}
                    />
                    <Label htmlFor="nfc-enabled">NFC Özelliği Aktif</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-active"
                      checked={product.is_active}
                      onCheckedChange={(checked) => setProduct({ ...product, is_active: checked === true })}
                    />
                    <Label htmlFor="is-active">Ürün Aktif</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={product.featured}
                      onCheckedChange={(checked) => setProduct({ ...product, featured: checked === true })}
                    />
                    <Label htmlFor="featured">Öne Çıkan Ürün</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Açıklamalar</CardTitle>
                <CardDescription>Ürün açıklamaları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="short_description">Kısa Açıklama</Label>
                  <Textarea
                    id="short_description"
                    value={product.short_description}
                    onChange={(e) => setProduct({ ...product, short_description: e.target.value })}
                    rows={3}
                    placeholder="Ürün listelerinde görünecek kısa açıklama"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detaylı Açıklama</Label>
                  <Textarea
                    id="description"
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    rows={8}
                    placeholder="Ürünün detaylı açıklaması"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ürün Resimleri</CardTitle>
                <CardDescription>Ürünün görsel içerikleri</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addImage}>
                <Plus className="h-4 w-4 mr-2" />
                Resim Ekle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group border rounded-lg p-3">
                    <div className="relative h-48 mb-3">
                      <img
                        src={image.image_url || "/placeholder.svg"}
                        alt={image.alt_text}
                        className="w-full h-full object-contain rounded-md border"
                      />
                      {image.is_primary && <Badge className="absolute top-2 left-2 bg-green-500">Ana Resim</Badge>}
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={image.image_url}
                        onChange={(e) => updateImage(index, "image_url", e.target.value)}
                        placeholder="Resim URL'si"
                        className="text-sm"
                      />
                      <Input
                        value={image.alt_text}
                        onChange={(e) => updateImage(index, "alt_text", e.target.value)}
                        placeholder="Resim açıklaması"
                        className="text-sm"
                      />
                      <div className="flex justify-between gap-2">
                        {!image.is_primary && (
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setPrimaryImage(index)}>
                            Ana Resim Yap
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" className="flex-1" onClick={() => removeImage(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ürün Özellikleri</CardTitle>
                  <CardDescription>Ürünün öne çıkan özellikleri</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Özellik Ekle
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          value={feature.feature_name}
                          onChange={(e) => updateFeature(index, "feature_name", e.target.value)}
                          placeholder="Özellik adı"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={feature.feature_value}
                          onChange={(e) => updateFeature(index, "feature_value", e.target.value)}
                          placeholder="Değer"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={feature.sort_order}
                          onChange={(e) => updateFeature(index, "sort_order", Number.parseInt(e.target.value))}
                          placeholder="Sıra"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Teknik Özellikler</CardTitle>
                  <CardDescription>Ürünün teknik detayları</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addSpecification}>
                  <Plus className="h-4 w-4 mr-2" />
                  Özellik Ekle
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          value={spec.spec_name}
                          onChange={(e) => updateSpecification(index, "spec_name", e.target.value)}
                          placeholder="Özellik adı"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={spec.spec_value}
                          onChange={(e) => updateSpecification(index, "spec_value", e.target.value)}
                          placeholder="Değer"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={spec.sort_order}
                          onChange={(e) => updateSpecification(index, "sort_order", Number.parseInt(e.target.value))}
                          placeholder="Sıra"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
                  <Label htmlFor="price">Satış Fiyatı (₺) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: Number.parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Eski Fiyat (₺)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={product.original_price || ""}
                    onChange={(e) =>
                      setProduct({ ...product, original_price: Number.parseFloat(e.target.value) || null })
                    }
                    placeholder="İndirim varsa eski fiyatı girin"
                    step="0.01"
                    min="0"
                  />
                </div>

                {product.original_price && product.original_price > product.price && (
                  <div className="p-3 bg-green-50 rounded-md text-green-800 text-sm">
                    <div className="font-medium">İndirim Bilgisi</div>
                    <div className="flex justify-between mt-1">
                      <span>İndirim Miktarı:</span>
                      <span className="font-medium">{(product.original_price - product.price).toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span>İndirim Oranı:</span>
                      <span className="font-medium">
                        {Math.round((1 - product.price / product.original_price) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
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
                    onChange={(e) => setProduct({ ...product, stock: Number.parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="0"
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
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Aktif" : "Pasif"}
                      </Badge>
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
                <Label htmlFor="meta_title">SEO Başlık</Label>
                <Input
                  id="meta_title"
                  value={product.meta_title || ""}
                  onChange={(e) => setProduct({ ...product, meta_title: e.target.value })}
                  placeholder="Arama motorlarında görünecek başlık"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">SEO Açıklama</Label>
                <Textarea
                  id="meta_description"
                  value={product.meta_description || ""}
                  onChange={(e) => setProduct({ ...product, meta_description: e.target.value })}
                  placeholder="Arama motorlarında görünecek açıklama"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
