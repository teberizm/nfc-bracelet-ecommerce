"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Package, Plus, Edit } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  category_name: string
  primary_image: string
  is_active: boolean
  nfc_enabled: boolean
  created_at: string
}

export default function AdminProductsPage() {
  const { state } = useAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchProducts()
    }
  }, [state.isAuthenticated])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Token bulunamadı")
        return
      }

      console.log("Ürünler çekiliyor...")

      const response = await fetch("/api/admin/products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("API Response:", data)

      if (data.success) {
        setProducts(data.products || [])
        console.log("Ürünler yüklendi:", data.products?.length || 0)
      } else {
        setError(data.message || "Bilinmeyen hata")
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setError(`Ürünler yüklenirken hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category_name.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Ürünler yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProducts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
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

      {/* Arama */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ürün adı veya kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ürün Listesi */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={product.primary_image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.is_active ? (
                        <Badge variant="default">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                      {product.nfc_enabled && <Badge variant="outline">NFC</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{product.category_name}</p>
                    <p className="text-sm text-gray-500">Stok: {product.stock} adet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{product.price.toLocaleString("tr-TR")} ₺</p>
                  <p className="text-sm text-gray-500">{new Date(product.created_at).toLocaleDateString("tr-TR")}</p>
                  <Button size="sm" className="mt-2" asChild>
                    <Link href={`/admin/products/${product.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Düzenle
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
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
