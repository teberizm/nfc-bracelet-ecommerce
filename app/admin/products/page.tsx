"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, RefreshCw, Package, Plus, Edit, Eye, Star, ShoppingCart } from "lucide-react"
import Link from "next/link"

interface ProductFeature {
  id: string
  feature_name: string
  feature_value: string
  sort_order: number
}

interface ProductImage {
  id: string
  image_url: string
  alt_text: string
  is_primary: boolean
  sort_order: number
}

interface ProductSpecification {
  id: string
  spec_name: string
  spec_value: string
  sort_order: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  original_price: number | null
  stock: number
  category_name: string
  nfc_enabled: boolean
  is_active: boolean
  weight: string
  dimensions: string
  material: string
  rating: number
  review_count: number
  sales_count: number
  featured: boolean
  created_at: string
  updated_at: string
  features: ProductFeature[]
  images: ProductImage[]
  specifications: ProductSpecification[]
  primary_image: string
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateString
  }
}

export default function AdminProductsPage() {
  const { state } = useAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchProducts()
    }
  }, [state.isAuthenticated, sortBy, sortOrder])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
        limit: "50",
        offset: "0",
        _t: Date.now().toString(),
      })

      const response = await fetch(`/api/admin/products?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      const data = await response.json()
      if (data.success) {
        setProducts(data.products || [])
      } else {
        console.error("Ürünler yüklenirken hata:", data.message)
      }
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category_name.toLowerCase().includes(search.toLowerCase()) ||
      product.material.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        <div className="flex gap-2">
          <Button onClick={fetchProducts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ürün
          </Button>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ürün adı, kategori veya malzeme ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Oluşturma Tarihi</SelectItem>
                <SelectItem value="name">Ürün Adı</SelectItem>
                <SelectItem value="price">Fiyat</SelectItem>
                <SelectItem value="stock">Stok</SelectItem>
                <SelectItem value="sales_count">Satış Sayısı</SelectItem>
                <SelectItem value="rating">Değerlendirme</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Azalan</SelectItem>
                <SelectItem value="asc">Artan</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                Kartlar
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Tablo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ürün Listesi - Kart Görünümü */}
      {viewMode === "cards" && (
        <div className="grid gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  {/* Ürün Resmi */}
                  <div className="flex-shrink-0">
                    <img
                      src={product.primary_image || "/placeholder.svg?height=120&width=120"}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          {product.featured && <Badge variant="secondary">Öne Çıkan</Badge>}
                          {product.nfc_enabled && <Badge variant="outline">NFC</Badge>}
                          <Badge variant={product.is_active ? "default" : "destructive"}>
                            {product.is_active ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{product.category_name}</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{product.short_description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
                          {product.original_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {product.stock} adet
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-4 w-4" />
                            {product.sales_count} satış
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {product.rating.toFixed(1)} ({product.review_count})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ürün Özellikleri */}
                    {product.features && product.features.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Özellikler:</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.features.slice(0, 4).map((feature) => (
                            <Badge key={feature.id} variant="outline" className="text-xs">
                              {feature.feature_name}: {feature.feature_value}
                            </Badge>
                          ))}
                          {product.features.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.features.length - 4} daha
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ürün Spesifikasyonları */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Malzeme:</span>
                        <p className="font-medium">{product.material}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Boyut:</span>
                        <p className="font-medium">{product.dimensions}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ağırlık:</span>
                        <p className="font-medium">{product.weight}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Güncelleme:</span>
                        <p className="font-medium">{formatDate(product.updated_at)}</p>
                      </div>
                    </div>

                    {/* Aksiyonlar */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/product/${product.id}`} target="_blank">
                          <Eye className="h-4 w-4 mr-1" />
                          Önizle
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ürün Listesi - Tablo Görünümü */}
      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle>Ürün Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Satış</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.primary_image || "/placeholder.svg?height=40&width=40"}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.material}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                        {product.stock} adet
                      </Badge>
                    </TableCell>
                    <TableCell>{product.sales_count}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.is_active ? "default" : "destructive"}>
                          {product.is_active ? "Aktif" : "Pasif"}
                        </Badge>
                        {product.nfc_enabled && (
                          <Badge variant="outline" className="text-xs">
                            NFC
                          </Badge>
                        )}
                        {product.featured && (
                          <Badge variant="secondary" className="text-xs">
                            Öne Çıkan
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/product/${product.id}`} target="_blank">
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {search ? "Arama kriterlerine uygun ürün bulunamadı." : "Henüz ürün bulunmuyor."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
