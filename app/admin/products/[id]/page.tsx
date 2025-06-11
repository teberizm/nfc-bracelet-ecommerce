"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, Upload, Eye, Plus, X } from "lucide-react"
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
import Image from "next/image"
import { categories } from "@/lib/categories"

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
  price: string
  original_price: string | null
  stock: number
  category_id: string
  nfc_enabled: boolean
  is_active: boolean
  weight: string
  dimensions: string
  material: string
  rating: string
  review_count: number
  sales_count: number
  featured: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  features: ProductFeature[]
  specifications: ProductSpecification[]
  images: ProductImage[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableSubcategories, setAvailableSubcategories] = useState<{ id: string; name: string }[]>([])
  const [newImage, setNewImage] = useState({ image_url: "", alt_text: "" })
  const [activeTab, setActiveTab] = useState("details")

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/admin/products/${params.id}?_t=${Date.now()}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Ürün yüklenirken bir hata oluştu")
        }

        // Ensure features, specifications and images are arrays
        const productData = {
          ...data.product,
          features: Array.isArray(data.product.features) ? data.product.features : [],
          specifications: Array.isArray(data.product.specifications) ? data.product.specifications : [],
          images: Array.isArray(data.product.images) ? data.product.images : [],
        }

        setProduct(productData)

        // Set subcategories based on category
        const category = categories.find((c) => c.id === productData.category_id)
        if (category) {
          setAvailableSubcategories(category.subcategories)
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError(err instanceof Error ? err.message : "Ürün yüklenirken bir hata oluştu")
        toast.error("Ürün yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (!product) return

    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      setAvailableSubcategories(category.subcategories)
      setProduct({
        ...product,
        category_id: categoryId,
      })
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!product) return

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Ürün güncellenirken bir hata oluştu")
      }

      toast.success("Ürün başarıyla güncellendi")
    } catch (err) {
      console.error("Error saving product:", err)
      toast.error(err instanceof Error ? err.message : "Ürün güncellenirken bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0 && product) {
      // In a real app, you would upload the file to a server
      // For now, we'll just use a placeholder
      const newImageUrl = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(product.name)}`

      const newImages = [
        ...product.images,
        {
          image_url: newImageUrl,
          alt_text: product.name,
          sort_order: product.images.length,
          is_primary: product.images.length === 0,
        },
      ]

      setProduct({
        ...product,
        images: newImages,
      })

      toast.success("Resim eklendi")
    }
  }

  // Add new feature
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

    setProduct({
      ...product,
      features: newFeatures,
    })
  }

  // Remove feature
  const removeFeature = (index: number) => {
    if (!product) return

    const newFeatures = product.features.filter((_, i) => i !== index)

    setProduct({
      ...product,
      features: newFeatures,
    })
  }

  // Update feature
  const updateFeature = (index: number, field: keyof ProductFeature, value: string | number) => {
    if (!product) return

    const newFeatures = [...product.features]
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value,
    }

    setProduct({
      ...product,
      features: newFeatures,
    })
  }

  // Add new specification
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

    setProduct({
      ...product,
      specifications: newSpecs,
    })
  }

  // Remove specification
  const removeSpecification = (index: number) => {
    if (!product) return

    const newSpecs = product.specifications.filter((_, i) => i !== index)

    setProduct({
      ...product,
      specifications: newSpecs,
    })
  }

  // Update specification
  const updateSpecification = (index: number, field: keyof ProductSpecification, value: string | number) => {
    if (!product) return

    const newSpecs = [...product.specifications]
    newSpecs[index] = {
      ...newSpecs[index],
      [field]: value,
    }

    setProduct({
      ...product,
      specifications: newSpecs,
    })
  }

  // Remove image
  const removeImage = (index: number) => {
    if (!product) return

    const newImages = product.images.filter((_, i) => i !== index)

    // If we removed the primary image, make the first one primary
    if (product.images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true
    }

    setProduct({
      ...product,
      images: newImages,
    })
  }

  // Set primary image
  const setPrimaryImage = (index: number) => {
    if (!product) return

    const newImages = product.images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }))

    setProduct({
      ...product,
      images: newImages,
    })
  }

  // Format price for display
  const formatPrice = (price: string | null | undefined) => {
    if (!price) return "0.00"
    return Number.parseFloat(price).toFixed(2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Ürün yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Bir hata oluştu</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Geri Dön</Button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Ürün bulunamadı</h2>
          <p className="text-gray-500 mb-4">İstediğiniz ürün bulunamadı veya silinmiş olabilir.</p>
          <Button onClick={() => router.back()}>Geri Dön</Button>
        </div>
      </div>
    )
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
          <Button variant="outline" onClick={() => window.open(`/product/${product.slug}`, "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            Önizle
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Ürün Bilgileri</TabsTrigger>
          <TabsTrigger value="images">Resimler</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={product.slug}
                    onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">URL'de görünecek ürün adı</p>
                </div>

                {/* Kategori Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={product.category_id} onValueChange={handleCategoryChange}>
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

                <div className="space-y-2">
                  <Label htmlFor="material">Malzeme</Label>
                  <Input
                    id="material"
                    value={product.material}
                    onChange={(e) => setProduct({ ...product, material: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Boyutlar</Label>
                  <Input
                    id="dimensions"
                    value={product.dimensions}
                    onChange={(e) => setProduct({ ...product, dimensions: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Ağırlık</Label>
                  <Input
                    id="weight"
                    value={product.weight}
                    onChange={(e) => setProduct({ ...product, weight: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nfc-enabled"
                    checked={product.nfc_enabled}
                    onCheckedChange={(checked) => setProduct({ ...product, nfc_enabled: checked === true })}
                  />
                  <label htmlFor="nfc-enabled" className="text-sm font-medium">
                    NFC Özelliği Aktif
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={product.is_active}
                    onCheckedChange={(checked) => setProduct({ ...product, is_active: checked === true })}
                  />
                  <label htmlFor="is-active" className="text-sm font-medium">
                    Ürün Aktif
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={product.featured}
                    onCheckedChange={(checked) => setProduct({ ...product, featured: checked === true })}
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Öne Çıkan Ürün
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Açıklamalar */}
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
                  />
                  <p className="text-xs text-gray-500">Ürün listelerinde görünecek kısa açıklama</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detaylı Açıklama</Label>
                  <Textarea
                    id="description"
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ürün Resimleri</CardTitle>
              <CardDescription>Ürünün görsel içerikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group border rounded-lg p-2">
                    <div className="relative h-48 mb-2">
                      <Image
                        src={image.image_url || "/placeholder.svg"}
                        alt={image.alt_text}
                        fill
                        className="object-contain rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=400&width=400&text=Resim+Yüklenemedi"
                        }}
                      />
                      {image.is_primary && <Badge className="absolute top-2 left-2 bg-green-500">Ana Resim</Badge>}
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={image.alt_text}
                        onChange={(e) => {
                          const newImages = [...product.images]
                          newImages[index].alt_text = e.target.value
                          setProduct({ ...product, images: newImages })
                        }}
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

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Özellikler */}
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
                  {product.features.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Henüz özellik eklenmemiş. Özellik eklemek için "Özellik Ekle" butonuna tıklayın.
                    </div>
                  )}

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

            {/* Teknik Özellikler */}
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
                  {product.specifications.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Henüz teknik özellik eklenmemiş. Özellik eklemek için "Özellik Ekle" butonuna tıklayın.
                    </div>
                  )}

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
                  <Label htmlFor="price">Satış Fiyatı (₺)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Eski Fiyat (₺)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={product.original_price || ""}
                    onChange={(e) => setProduct({ ...product, original_price: e.target.value || null })}
                    placeholder="İndirim varsa eski fiyatı girin"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500">İndirim yoksa boş bırakın</p>
                </div>

                {product.original_price && (
                  <div className="p-3 bg-green-50 rounded-md text-green-800 text-sm">
                    <div className="font-medium">İndirim Bilgisi</div>
                    <div className="flex justify-between mt-1">
                      <span>İndirim Miktarı:</span>
                      <span className="font-medium">
                        {(Number.parseFloat(product.original_price) - Number.parseFloat(product.price)).toFixed(2)} ₺
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>İndirim Oranı:</span>
                      <span className="font-medium">
                        {Math.round(
                          (1 - Number.parseFloat(product.price) / Number.parseFloat(product.original_price)) * 100,
                        )}
                        %
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
                    onChange={(e) => setProduct({ ...product, stock: Number.parseInt(e.target.value) })}
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
                      <Badge className={product.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {product.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Satış:</span>
                      <span className="font-medium">{product.sales_count} adet</span>
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
                <p className="text-xs text-gray-500">Boş bırakırsanız ürün adı kullanılır</p>
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
                <p className="text-xs text-gray-500">Boş bırakırsanız kısa açıklama kullanılır</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={product.slug}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                />
                <p className="text-xs text-gray-500">Ürünün URL'de görünecek adı</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
