"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Package, Plus } from "lucide-react"
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

// Güvenli sayı formatlaması
const formatPrice = (price: any): string => {
  try {
    const numPrice = Number(price)
    if (isNaN(numPrice)) return "0 ₺"
    return numPrice.toLocaleString("tr-TR") + " ₺"
  } catch {
    return "0 ₺"
  }
}

// Güvenli tarih formatlaması
const formatDate = (dateString: any): string => {
  try {
    if (!dateString) return "Tarih yok"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Geçersiz tarih"
    return date.toLocaleDateString("tr-TR")
  } catch {
    return "Tarih hatası"
  }
}

// Güvenli sayı formatlaması
const formatNumber = (num: any): number => {
  try {
    const parsed = Number(num)
    return isNaN(parsed) ? 0 : parsed
  } catch {
    return 0
  }
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
        // Veriyi güvenli şekilde işle
        const safeProducts = (data.products || []).map((product: any) => ({
          id: product.id || "",
          name: product.name || "İsimsiz Ürün",
          slug: product.slug || "",
          price: formatNumber(product.price),
          stock: formatNumber(product.stock),
          category_name: product.category_name || "Kategori Yok",
          primary_image: product.primary_image || "/placeholder.svg?height=64&width=64&text=Ürün",
          is_active: Boolean(product.is_active),
          nfc_enabled: Boolean(product.nfc_enabled),
          created_at: product.created_at || new Date().toISOString(),
        }))

        setProducts(safeProducts)
        console.log("Ürünler güvenli şekilde yüklendi:", safeProducts.length)
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
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ürün
            </Link>
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
              className="pl-10\"
