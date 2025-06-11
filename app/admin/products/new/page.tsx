"use client"

import { useState, useRef, type FormEvent, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload, X, Plus, Trash2, RefreshCw, EyeIcon as Eye360 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAdmin } from "@/contexts/admin-context"

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
  category_id: string
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

const categories = [
  { id: "1", name: "NFC Bileklik" },
  { id: "2", name: "Akıllı Bileklik" },
  { id: "3", name: "Özel Tasarım" },
  { id: "4", name: "Aksesuar" },
]

export default function NewProductPage() {
  const router = useRouter()
  const { state } = useAdmin()
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
    category_id: "",
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
      // Dosya tipi kontrolü
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")

      if (!isImage && !isVideo) {
        throw new Error("Desteklenmeyen dosya formatı")
      }

      // Form data oluştur
      const formData = new FormData()
      formData.append("file", file)

      // Dosya tipini belirt
      formData.append("fileType", isImage ? "image" : "video")

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
      return data.url
    } catch (error) {
      console.error("Dosya yükleme hatası:", error)
      throw error
    }
  }

  // Tüm resimleri yükle
  const uploadAllImages = async (): Promise<{ imageUrls: string[]; primaryImageUrl: string }> => {
    try {
      setUploading(true)

      // Yüklenecek resimler var mı kontrol et
      if (productData.images.length === 0) {
        return { imageUrls: [], primaryImageUrl: "" }
      }

      // Tüm resimleri yükle
      const uploadPromises = productData.images.map(async (image, index) => {
        if (!image.file) return null

        // Resim durumunu güncelle
        const updatedImages = [...productData.images]
        updatedImages[index] = {
          ...updatedImages[index],
          is_uploading: true,
          upload_progress: 0,
        }

        setProductData({
          ...productData,
          images: updatedImages,
        })

        try {
          // Resmi yükle
          const url = await uploadFile(image.file)

          // Başarılı yükleme durumunu güncelle
          const successImages = [...productData.images]
          successImages[index] = {
            ...successImages[index],
            is_uploading: false,
            upload_progress: 100,
            uploaded_url: url,
          }

          setProductData({
            ...productData,
            images: successImages,
          })

          return {
            url,
            is_primary: image.is_primary,
            alt_text: image.alt_text,
          }
        } catch (error) {
          // Hata durumunu güncelle
          const errorImages = [...productData.images]
          errorImages[index] = {
            ...errorImages[index],
            is_uploading: false,
            upload_progress: 0,
          }

          setProductData({
            ...productData,
            images: errorImages,
          })

          throw error
        }
      })

      // Tüm yüklemeleri bekle
      const results = await Promise.all(uploadPromises)

      // Null olmayan sonuçları filtrele
      const validResults = results.filter(Boolean) as { url: string; is_primary: boolean; alt_text: string }[]

      // URL'leri ve ana resmi döndür
      const imageUrls = validResults.map((r) => r.url)
      const primaryImage = validResults.find((r) => r.is_primary)

      return {
        imageUrls,
        primaryImageUrl: primaryImage?.url || (imageUrls.length > 0 ? imageUrls[0] : ""),
      }
    } catch (error) {
      console.error("Resim yükleme hatası:", error)
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
      const url = await uploadFile(video360File)
      setVideo360Url(url)
      return url
    } catch (error) {
      console.error("360 video yükleme hatası:", error)
      throw error
    } finally {
      setVideo360Uploading(false)
    }
  }

  // Ürün kaydetme
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

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

      // Resimleri yükle
      let imageResults = { imageUrls: [], primaryImageUrl: "" }
      let video360UploadedUrl = ""

      try {
        // Önce resimleri yükle
        imageResults = await uploadAllImages()

        // Sonra 360 videoyu yükle (varsa)
        if (video360File) {
          video360UploadedUrl = await uploadVideo360()
        }
      } catch (error) {
        toast.error("Dosya yükleme sırasında bir hata oluştu")
        console.error("Dosya yükleme hatası:", error)
        return
      }

      // Ürün verilerini hazırla
      const productPayload = {
        ...productData,
        video_360_url: video360UploadedUrl || video360Url,
        images: imageResults.imageUrls.map((url, index) => ({
          image_url: url,
          alt_text: productData.images[index]?.alt_text || productData.name,
          is_primary: index === 0, // İlk resim ana resim olsun
          sort_order: index,
        })),
      }

      console.log("Ürün kaydediliyor:", productPayload)

      // API'ye gönder
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(productPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Ürün kaydedilirken bir hata oluştu")
      }

      const data = await response.json()

      toast.success("Ürün başarıyla kaydedildi")

      // Ürün listesine yönlendir
      router.push("/admin/products")
    } catch (error) {
      console.error("Ürün kaydetme hatası:", error)
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
          <Button onClick={handleSubmit} disabled={saving || uploading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                      value={productData.category_id}
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

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ürün Resimleri</CardTitle>
                  <CardDescription>En fazla 3 resim yükleyebilirsiniz</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={productData.images.length >= 3}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Resim Ekle
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  multiple
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productData.images.map((image, index) => (
                    <div key={index} className="relative group border rounded-lg p-3">
                      <div className="relative h-48 mb-3">
                        <img
                          src={image.previewUrl || "/placeholder.svg"}
                          alt={image.alt_text}
                          className="w-full h-full object-contain rounded-md border"
                        />
                        {image.is_primary && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Ana Resim
                          </div>
                        )}
                        {image.is_uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                            <RefreshCw className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={image.alt_text}
                          onChange={(e) => updateImageAltText(index, e.target.value)}
                          placeholder="Resim açıklaması"
                          className="text-sm"
                        />
                        <div className="flex justify-between gap-2">
                          {!image.is_primary && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setPrimaryImage(index)}
                            >
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

                {productData.images.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Henüz resim eklenmemiş</p>
                    <p className="text-sm">Resim eklemek için "Resim Ekle" butonuna tıklayın</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>360° Video</CardTitle>
                  <CardDescription>Ürünün 360 derece videosu</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => video360InputRef.current?.click()}
                  disabled={!!video360File || video360Uploading}
                >
                  <Eye360 className="h-4 w-4 mr-2" />
                  Video Ekle
                </Button>
                <input
                  type="file"
                  ref={video360InputRef}
                  onChange={handleVideo360Upload}
                  accept="video/*"
                  className="hidden"
                />
              </CardHeader>
              <CardContent>
                {video360Preview ? (
                  <Video360Preview />
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                    <Eye360 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Henüz 360° video eklenmemiş</p>
                    <p className="text-sm">Video eklemek için "Video Ekle" butonuna tıklayın</p>
                  </div>
                )}
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
