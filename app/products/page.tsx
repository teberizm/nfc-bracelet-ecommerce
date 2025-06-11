"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SlidersHorizontal, Package, RefreshCw } from "lucide-react"
import type { Product } from "@/contexts/cart-context"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState("all")

  // Kategoriler
  const categories = [
    { value: "all", label: "Tüm Kategoriler" },
    { value: "deri", label: "Deri Bileklik" },
    { value: "metal", label: "Metal Bileklik" },
    { value: "silikon", label: "Silikon Bileklik" },
    { value: "ozel-tasarim", label: "Özel Tasarım" },
  ]

  // Fiyat aralıkları
  const priceRanges = [
    { value: "all", label: "Tüm Fiyatlar" },
    { value: "0-100", label: "0₺ - 100₺" },
    { value: "100-300", label: "100₺ - 300₺" },
    { value: "300-500", label: "300₺ - 500₺" },
    { value: "500+", label: "500₺ +" },
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, search, selectedCategory, sortBy, priceRange])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Ürünler sayfası: Ürünler çekiliyor...")

      const response = await fetch("/api/products?limit=100")

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Ürünler sayfası: API'den gelen ürünler:", data)

      if (!Array.isArray(data)) {
        throw new Error("API'den beklenmeyen veri formatı geldi")
      }

      // Kendin Tasarla ürününü ekle
      const customDesignProduct: Product = {
        id: "custom-design",
        name: "Kendin Tasarla",
        price: 0,
        image: "/placeholder.svg?height=300&width=300",
        description:
          "Hayalinizdeki tasarımı gerçeğe dönüştürün! Bize görseli gönderin, size özel fiyat teklifi verelim.",
        nfcEnabled: true,
        stock: 999,
        category: "Özel Tasarım",
        rating: 5,
        isCustomDesign: true,
        featured: false,
      }

      const allProducts = [customDesignProduct, ...data]
      setProducts(allProducts)
      console.log(`Ürünler sayfası: ${allProducts.length} ürün yüklendi`)
    } catch (error) {
      console.error("Ürünler sayfası: Ürünler yüklenirken hata:", error)
      setError("Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.")
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Arama filtresi
    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Kategori filtresi
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => {
        const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-")
        return categorySlug.includes(selectedCategory) || selectedCategory.includes(categorySlug)
      })
    }

    // Fiyat aralığı filtresi
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        if (priceRange === "0-100") return product.price >= 0 && product.price <= 100
        if (priceRange === "100-300") return product.price > 100 && product.price <= 300
        if (priceRange === "300-500") return product.price > 300 && product.price <= 500
        if (priceRange === "500+") return product.price > 500
        return true
      })
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case "name":
        default:
          return a.name.localeCompare(b.name, "tr")
      }
    })

    setFilteredProducts(filtered)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Ürünlerimiz</h1>
          <p className="text-gray-600">NFC teknolojisi ile donatılmış özel bilekliklerimizi keşfedin</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Başlık */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Ürünlerimiz</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          NFC teknolojisi ile donatılmış özel bilekliklerimizi keşfedin. Anılarınızı teknoloji ile buluşturun.
        </p>
      </div>

      {/* Filtreler */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Kategori */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Fiyat Aralığı */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Fiyat aralığı" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sıralama */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">İsme Göre (A-Z)</SelectItem>
                <SelectItem value="price-low">Fiyat (Düşük-Yüksek)</SelectItem>
                <SelectItem value="price-high">Fiyat (Yüksek-Düşük)</SelectItem>
                <SelectItem value="rating">Puana Göre</SelectItem>
                <SelectItem value="newest">En Yeni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sonuç Sayısı */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {filteredProducts.length} ürün bulundu
          {search && ` "${search}" için`}
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Filtreler aktif</span>
        </div>
      </div>

      {/* Ürün Listesi */}
      {filteredProducts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ürün Bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {search ? `"${search}" aramanız için ürün bulunamadı.` : "Seçtiğiniz filtrelere uygun ürün bulunamadı."}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("")
              setSelectedCategory("all")
              setPriceRange("all")
              setSortBy("name")
            }}
          >
            Filtreleri Temizle
          </Button>
        </div>
      )}

      {/* NFC Bilgi Kartı */}
      <Card className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-600">
              <Filter className="h-4 w-4 mr-2" />
              NFC Teknolojisi
            </Badge>
            <h3 className="text-xl font-semibold mb-2">Tüm Ürünlerimiz NFC Özellikli</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bilekliklerimiz NFC teknolojisi ile donatılmıştır. Telefonunuzu yaklaştırarak fotoğraflarınızı,
              videolarınızı ve özel mesajlarınızı anında paylaşabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
