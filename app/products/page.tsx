"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Zap } from "lucide-react"
import { products } from "@/lib/products"
import { categories } from "@/lib/categories"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const [showNfcOnly, setShowNfcOnly] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [availableSubcategories, setAvailableSubcategories] = useState<{ id: string; name: string }[]>([])

  // Kategori değiştiğinde alt kategorileri güncelle
  useEffect(() => {
    if (selectedCategory === "all") {
      setAvailableSubcategories([])
      setSelectedSubcategory("all")
    } else {
      const category = categories.find((c) => c.id === selectedCategory)
      if (category) {
        setAvailableSubcategories(category.subcategories)
        setSelectedSubcategory("all")
      }
    }
  }, [selectedCategory])

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory

      const matchesSubcategory =
        selectedSubcategory === "all" || (matchesCategory && product.subcategory.toLowerCase() === selectedSubcategory)

      const matchesNfc = !showNfcOnly || product.nfcEnabled

      return matchesSearch && matchesCategory && matchesSubcategory && matchesNfc
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Tüm Ürünler</h1>
        <p className="text-gray-600">NFC teknolojisi ile donatılmış özel takılarımızı keşfedin.</p>
      </div>

      {/* Filtreler */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Ana Kategori */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Alt Kategori */}
            <Select
              value={selectedSubcategory}
              onValueChange={setSelectedSubcategory}
              disabled={selectedCategory === "all" || availableSubcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alt kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Alt Kategoriler</SelectItem>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
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
                <SelectItem value="name">İsme Göre</SelectItem>
                <SelectItem value="price-low">Fiyat (Düşük-Yüksek)</SelectItem>
                <SelectItem value="price-high">Fiyat (Yüksek-Düşük)</SelectItem>
                <SelectItem value="rating">Puana Göre</SelectItem>
              </SelectContent>
            </Select>

            {/* NFC Filtresi */}
            <div className="flex items-center space-x-2 md:col-span-2 lg:col-span-4">
              <Checkbox id="nfc-only" checked={showNfcOnly} onCheckedChange={setShowNfcOnly} />
              <label htmlFor="nfc-only" className="text-sm font-medium flex items-center gap-1">
                <Zap className="h-4 w-4 text-blue-600" />
                Sadece NFC Özellikli Ürünler
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sonuç Sayısı */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">{filteredProducts.length} ürün bulundu</p>
        {(searchTerm || selectedCategory !== "all" || selectedSubcategory !== "all" || showNfcOnly) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
              setSelectedSubcategory("all")
              setShowNfcOnly(false)
            }}
          >
            Filtreleri Temizle
          </Button>
        )}
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
          <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ürün Bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            Arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.
          </p>
          <Button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
              setSelectedSubcategory("all")
              setShowNfcOnly(false)
            }}
          >
            Tüm Ürünleri Göster
          </Button>
        </div>
      )}
    </div>
  )
}
