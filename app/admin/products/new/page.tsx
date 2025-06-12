"use client"

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, Plus, Upload, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface ProductImage {
  file: File | null
  previewUrl: string
  alt_text: string
  is_primary: boolean
  is_uploading?: boolean
  upload_progress?: number
  uploaded_url?: string
}

interface ProductFeature {
  feature_name: string
  feature_value: string
  sort_order: number
}

interface ProductSpecification {
  spec_name: string
  spec_value: string
  sort_order: number
}

interface NewProductData {
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  original_price: number | null
  stock: number
  category_id: string | null
  nfc_enabled: boolean
  is_active: boolean
  weight: string
  dimensions: string
  material: string
  featured: boolean
  meta_title: string
  meta_description: string
  features: ProductFeature[]
  specifications: ProductSpecification[]
  images: ProductImage[]
  video_360_url: string
}

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [video360Uploading, setVideo360Uploading] = useState(false)
  const [video360File, setVideo360File] = useState<File | null>(null)
  const [video360Preview, setVideo360Preview] = useState<string>("")
  const [video360Url, setVideo360Url] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const video360InputRef = useRef<HTMLInputElement>(null)

  const [productData, setProductData] = useState<NewProductData>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: 0,
    original_price: null,
    stock: 0,
    category_id: null,
    nfc_enabled: false,
    is_active: true,
    weight: "",
    dimensions: "",
    material: "",
    featured: false,
    meta_title: "",
    meta_description: "",
    features: [],
    specifications: [],
    images: [],
    video_360_url: "",
  })
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories')
        const data = await res.json()
        if (Array.isArray(data)) {
          setCategories(data)
        }
      } catch (err) {
        console.error('Kategori yüklenirken hata:', err)
      }
    }
    fetchCategories()
  }, [])
  
  // Slug oluşturma fonksiyonu
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
      .trim()
  }

  // İsim değiştiğinde slug otomatik oluştur
  const handleNameChange = (name: string) => {
    setProductData({
      ...productData,
      name,
      slug: generateSlug(name),
    })
  }

  // Resim yükleme işlemi
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    const newImages: ProductImage[] = [...productData.images]

    newFiles.forEach((file) => {
      // Maksimum 3 resim kontrolü
      if (newImages.length >= 3) {
        toast.error("En fazla 3 resim yükleyebilirsiniz")
        return
      }

      const isPrimary = newImages.length === 0 // İlk resim ana resim olsun
      const previewUrl = URL.createObjectURL(file)

      newImages.push({
        file,
        previewUrl,
        alt_text: productData.name || file.name,
        is_primary: isPrimary,
      })
    })

    setProductData({
      ...productData,
      images: newImages,
    })

    // Input değerini sıfırla (aynı dosyayı tekrar seçebilmek için)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 360 video yükleme işlemi
  const handleVideo360Upload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    // Dosya tipi kontrolü
    if (!file.type.includes("video/")) {
      toast.error("Lütfen geçerli bir video dosyası seçin")
      return
    }

    setVideo360File(file)
    setVideo360Preview(URL.createObjectURL(file))

    // Input değerini sıfırla
    if (video360InputRef.current) {
      video360InputRef.current.value = ""
    }
  }

  // Resim silme işlemi
  const removeImage = (index: number) => {
    const newImages = [...productData.images]

    // Eğer silinen resim ana resimse, ilk resmi ana resim yap
    if (newImages[index].is_primary && newImages.length > 1) {
      const newPrimaryIndex = index === 0 ? 1 : 0
      newImages[newPrimaryIndex].is_primary = true
    }

    // URL.revokeObjectURL ile bellek temizliği
    if (newImages[index].previewUrl) {
      URL.revokeObjectURL(newImages[index].previewUrl)
    }

    newImages.splice(index, 1)

    setProductData({
      ...productData,
      images: newImages,
    })
  }

  // Ana resim belirleme
  const setPrimaryImage = (index: number) => {
    const newImages = productData.images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }))

    setProductData({
      ...productData,
      images: newImages,
    })
  }

  // Resim alt text güncelleme
  const updateImageAltText = (index: number, altText: string) => {
    const newImages = [...productData.images]
    newImages[index].alt_text = altText

    setProductData({
      ...productData,
      images: newImages,
    })
  }

  // Özellik ekleme
  const addFeature = () => {
    setProductData({
      ...productData,
      features: [
        ...productData.features,
        {
          feature_name: "",
          feature_value: "",
          sort_order: productData.features.length,
        },
      ],
    })
  }

  // Özellik silme
  const removeFeature = (index: number) => {
    const newFeatures = productData.features.filter((_, i) => i !== index)
    setProductData({
      ...productData,
      features: newFeatures,
    })
  }

  // Özellik güncelleme
  const updateFeature = (index: number, field: keyof ProductFeature, value: string | number) => {
    const newFeatures = [...productData.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }

    setProductData({
      ...productData,
      features: newFeatures,
    })
  }

  // Teknik özellik ekleme
  const addSpecification = () => {
    setProductData({
      ...productData,
      specifications: [
        ...productData.specifications,
        {
          spec_name: "",
          spec_value: "",
          sort_order: productData.specifications.length,
        },
      ],
    })
  }

  // Teknik özellik silme
  const removeSpecification = (index: number) => {
    const newSpecs = productData.specifications.filter((_, i) => i !== index)
    setProductData({
      ...productData,
      specifications: newSpecs,
    })
  }

  // Teknik özellik güncelleme
  const updateSpecification = (index: number, field: keyof ProductSpecification, value: string | number) => {
    const newSpecs = [...productData.specifications]
    newSpecs[index] = { ...newSpecs[index], [field]: value }

    setProductData({
      ...productData,
      specifications: newSpecs,
    })
  }

  // Dosya yükleme fonksiyonu
  const uploadFile = async (file: File): Promise<string> => {
    try {
      console.log("📤 Dosya yükleniyor:", file.name, file.type)

      // Form data oluştur
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", file.type.startsWith("image/") ? "image" : "video")

      // API'ye gönder
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Dosya yüklenirken bir hata oluştu")
      }

      const data = await response.json()
      console.log("✅ Dosya yüklendi:", data.url)
      return data.url
    } catch (error) {
      console.error("❌ Dosya yükleme hatası:", error)
      throw error
    }
  }

  // Tüm resimleri yükle
  const uploadAllImages = async (): Promise<{ imageUrls: any[]; primaryImageUrl: string }> => {
    try {
      setUploading(true)

      if (productData.images.length === 0) {
        return { imageUrls: [], primaryImageUrl: "" }
      }

      console.log("📸 Toplam", productData.images.length, "resim yüklenecek")

      const uploadPromises = productData.images.map(async (image, index) => {
        if (!image.file) return null

        try {
          const url = await uploadFile(image.file)
          return {
            image_url: url,
            url: url, // Alternatif alan adı
            is_primary: image.is_primary,
            alt_text: image.alt_text,
            sort_order: index,
          }
        } catch (error) {
          console.error(`❌ Resim ${index + 1} yüklenemedi:`, error)
          throw error
        }
      })

      const results = await Promise.all(uploadPromises)
      const validResults = results.filter(Boolean) as any[]

      const imageUrls = validResults.map((r) => r.image_url)
      const primaryImage = validResults.find((r) => r.is_primary)

      return {
        imageUrls: validResults,
        primaryImageUrl: primaryImage?.image_url || (imageUrls.length > 0 ? imageUrls[0] : ""),
      }
    } catch (error) {
      console.error("❌ Resim yükleme hatası:", error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  // 360 video yükleme
  const uploadVideo360 = async (): Promise<string> => {
    if (!video360File) return ""

    try {
      setVideo360Uploading(true)
      console.log("🎥 360° video yükleniyor...")
      const url = await uploadFile(video360File)
      setVideo360Url(url)
      console.log("✅ 360° video yüklendi:", url)
      return url
    } catch (error) {
      console.error("❌ 360 video yükleme hatası:", error)
      throw error
    } finally {
      setVideo360Uploading(false)
    }
  }

  // Ürün kaydetme - DOSYA YÜKLEME İLE
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      console.log("💾 Ürün kaydetme işlemi başlıyor...")

      // Zorunlu alanları kontrol et
      if (!productData.name.trim()) {
        toast.error("Ürün adı zorunludur")
        return
      }

      if (!productData.slug.trim()) {
        toast.error("Ürün slug'ı zorunludur")
        return
      }

      if (!productData.price || productData.price <= 0) {
        toast.error("Geçerli bir fiyat giriniz")
        return
      }

      // 1. Önce resimleri yükle
      console.log("📸 Resimler yükleniyor...")
      const { imageUrls } = await uploadAllImages()

      // 2. 360° video varsa yükle
      let video360Url = ""
      if (video360File) {
        console.log("🎥 360° video yükleniyor...")
        video360Url = await uploadVideo360()
      }

      // 3. Ürün verilerini hazırla
      const productPayload = {
        ...productData,
        video_360_url: video360Url,
        images: imageUrls,
      }

      console.log("📦 Ürün kaydediliyor...")
      console.log("🎥 360° Video URL:", video360Url || "Yok")
      console.log("📊 Kategori ID:", productPayload.category_id, "Tipi:", typeof productPayload.category_id)

      // 4. API'ye gönder
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productPayload),
      })

      console.log("📡 API yanıtı:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ API hatası:", errorData)
        throw new Error(errorData.message || "Ürün kaydedilirken bir hata oluştu")
      }

      const data = await response.json()
      console.log("✅ Ürün başarıyla kaydedildi:", data)

      toast.success("Ürün başarıyla kaydedildi!")
      router.push("/admin/products")
    } catch (error) {
      console.error("❌ Ürün kaydetme hatası:", error)
      toast.error(error instanceof Error ? error.message : "Ürün kaydedilirken bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  // 360 video önizleme
  const Video360Preview = () => {
    if (!video360Preview) return null

    return (
      <div className="relative mt-4">
        <video
          src={video360Preview}
          controls
          className="w-full h-auto rounded-lg border"
          style={{ maxHeight: "300px" }}
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => {
            URL.revokeObjectURL(video360Preview)
            setVideo360Preview("")
            setVideo360File(null)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
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
            <h1 className="text-2xl font-bold">Yeni Ürün Ekle</h1>
            <p className="text-gray-500">Ürün bilgilerini doldurun ve kaydedin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={saving || uploading || video360Uploading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="media">Medya</TabsTrigger>
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
                      value={productData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ürün adını girin"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={productData.slug}
                      onChange={(e) => setProductData({ ...productData, slug: e.target.value })}
                      placeholder="url-slug"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={productData.category_id || undefined}
                      onValueChange={(value) => setProductData({ ...productData, category_id: value })}
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
                      value={productData.material}
                      onChange={(e) => setProductData({ ...productData, material: e.target.value })}
                      placeholder="Ürün malzemesi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Boyutlar</Label>
                    <Input
                      id="dimensions"
                      value={productData.dimensions}
                      onChange={(e) => setProductData({ ...productData, dimensions: e.target.value })}
                      placeholder="Ürün boyutları"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Ağırlık</Label>
                    <Input
                      id="weight"
                      value={productData.weight}
                      onChange={(e) => setProductData({ ...productData, weight: e.target.value })}
                      placeholder="Ürün ağırlığı"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nfc-enabled"
                        checked={productData.nfc_enabled}
                        onCheckedChange={(checked) => setProductData({ ...productData, nfc_enabled: checked === true })}
                      />
                      <Label htmlFor="nfc-enabled">NFC Özelliği Aktif</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-active"
                        checked={productData.is_active}
                        onCheckedChange={(checked) => setProductData({ ...productData, is_active: checked === true })}
                      />
                      <Label htmlFor="is-active">Ürün Aktif</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={productData.featured}
                        onCheckedChange={(checked) => setProductData({ ...productData, featured: checked === true })}
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
                      value={productData.short_description}
                      onChange={(e) => setProductData({ ...productData, short_description: e.target.value })}
                      rows={3}
                      placeholder="Ürün listelerinde görünecek kısa açıklama"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detaylı Açıklama</Label>
                    <Textarea
                      id="description"
                      value={productData.description}
                      onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                      rows={8}
                      placeholder="Ürünün detaylı açıklaması"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ürün Resimleri</CardTitle>
                  <CardDescription>En fazla 3 resim yükleyebilirsiniz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Resim Yükle</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={productData.images.length >= 3}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Resim Seç
                      </Button>
                      <span className="text-sm text-gray-500">{productData.images.length}/3 resim yüklendi</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {productData.images.length > 0 && (
                    <div className="space-y-4">
                      {productData.images.map((image, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={image.previewUrl || "/placeholder.svg"}
                              alt={image.alt_text}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Checkbox checked={image.is_primary} onCheckedChange={() => setPrimaryImage(index)} />
                                <Label className="text-sm">Ana Resim</Label>
                              </div>
                              <Input
                                value={image.alt_text}
                                onChange={(e) => updateImageAltText(index, e.target.value)}
                                placeholder="Alt text"
                                className="text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>360° Video</CardTitle>
                  <CardDescription>Ürün için 360 derece video yükleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>360° Video Yükle</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => video360InputRef.current?.click()}
                        disabled={video360Uploading}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        {video360Uploading ? "Yükleniyor..." : "Video Seç"}
                      </Button>
                      {video360File && <span className="text-sm text-green-600">✅ {video360File.name}</span>}
                    </div>
                    <input
                      ref={video360InputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideo360Upload}
                      className="hidden"
                    />
                  </div>

                  <Video360Preview />
                </CardContent>
              </Card>
            </div>
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
                    {productData.features.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Henüz özellik eklenmemiş. Özellik eklemek için "Özellik Ekle" butonuna tıklayın.
                      </div>
                    )}

                    {productData.features.map((feature, index) => (
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
                    {productData.specifications.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Henüz teknik özellik eklenmemiş. Özellik eklemek için "Özellik Ekle" butonuna tıklayın.
                      </div>
                    )}

                    {productData.specifications.map((spec, index) => (
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
                      value={productData.price}
                      onChange={(e) =>
                        setProductData({ ...productData, price: Number.parseFloat(e.target.value) || 0 })
                      }
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="original_price">Eski Fiyat (₺)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={productData.original_price || ""}
                      onChange={(e) =>
                        setProductData({ ...productData, original_price: Number.parseFloat(e.target.value) || null })
                      }
                      placeholder="İndirim varsa eski fiyatı girin"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {productData.original_price && productData.original_price > productData.price && (
                    <div className="p-3 bg-green-50 rounded-md text-green-800 text-sm">
                      <div className="font-medium">İndirim Bilgisi</div>
                      <div className="flex justify-between mt-1">
                        <span>İndirim Miktarı:</span>
                        <span className="font-medium">
                          {(productData.original_price - productData.price).toFixed(2)} ₺
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>İndirim Oranı:</span>
                        <span className="font-medium">
                          {Math.round((1 - productData.price / productData.original_price) * 100)}%
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
                      value={productData.stock}
                      onChange={(e) => setProductData({ ...productData, stock: Number.parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                    />
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
                    value={productData.meta_title}
                    onChange={(e) => setProductData({ ...productData, meta_title: e.target.value })}
                    placeholder="Arama motorlarında görünecek başlık"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">SEO Açıklama</Label>
                  <Textarea
                    id="meta_description"
                    value={productData.meta_description}
                    onChange={(e) => setProductData({ ...productData, meta_description: e.target.value })}
                    placeholder="Arama motorlarında görünecek açıklama"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
