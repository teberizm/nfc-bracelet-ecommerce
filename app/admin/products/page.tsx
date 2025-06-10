"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, ArrowUpDown, Eye, Edit, MoreHorizontal, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/contexts/admin-context"

// Mock ürün verileri
const mockProducts = [
  {
    id: "1",
    name: "Premium NFC Deri Bileklik",
    description: "Gerçek deri ve NFC teknolojisi ile üretilmiş premium bileklik",
    price: 299,
    category: "Premium",
    stock: 25,
    nfcEnabled: true,
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
    createdAt: "2024-01-01T00:00:00Z",
    sales: 45,
  },
  {
    id: "2",
    name: "Spor NFC Silikon Bileklik",
    description: "Su geçirmez silikon malzeme ile üretilmiş spor bileklik",
    price: 199,
    category: "Spor",
    stock: 50,
    nfcEnabled: true,
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
    createdAt: "2024-01-02T00:00:00Z",
    sales: 78,
  },
  {
    id: "3",
    name: "Lüks NFC Metal Bileklik",
    description: "Paslanmaz çelik ve NFC teknolojisi ile üretilmiş lüks bileklik",
    price: 499,
    category: "Lüks",
    stock: 15,
    nfcEnabled: true,
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
    createdAt: "2024-01-03T00:00:00Z",
    sales: 23,
  },
  {
    id: "4",
    name: "Klasik Deri Bileklik",
    description: "Geleneksel deri işçiliği ile üretilmiş klasik bileklik",
    price: 149,
    category: "Klasik",
    stock: 30,
    nfcEnabled: false,
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
    createdAt: "2024-01-04T00:00:00Z",
    sales: 12,
  },
]

export default function AdminProductsPage() {
  const { state } = useAdmin()
  const router = useRouter()
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  }>({ key: "createdAt", direction: "desc" })

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  // Filtreleme
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Sıralama
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const key = sortConfig.key as keyof typeof a
    if (a[key] < b[key]) {
      return sortConfig.direction === "asc" ? -1 : 1
    }
    if (a[key] > b[key]) {
      return sortConfig.direction === "asc" ? 1 : -1
    }
    return 0
  })

  // Sıralama değiştirme
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ürünler</h1>
          <p className="text-gray-600">Tüm ürünleri yönetin</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ürün
          </Link>
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
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

            {/* Kategori Filtresi */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Kategori" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Spor">Spor</SelectItem>
                <SelectItem value="Lüks">Lüks</SelectItem>
                <SelectItem value="Klasik">Klasik</SelectItem>
              </SelectContent>
            </Select>

            {/* Durum Filtresi */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Durum" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ürün Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Ürünler ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                    <div className="flex items-center gap-1">
                      Ürün
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("category")}>
                    <div className="flex items-center gap-1">
                      Kategori
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("price")}>
                    <div className="flex items-center gap-1">
                      Fiyat
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("stock")}>
                    <div className="flex items-center gap-1">
                      Stok
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("sales")}>
                    <div className="flex items-center gap-1">
                      Satış
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                    <div className="flex items-center gap-1">
                      Durum
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Ürün bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded-md object-cover"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500 max-w-xs truncate">{product.description}</p>
                            {product.nfcEnabled && (
                              <Badge variant="secondary" className="mt-1">
                                <Zap className="h-3 w-3 mr-1" />
                                NFC
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">₺{product.price.toLocaleString("tr-TR")}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            product.stock > 20
                              ? "bg-green-100 text-green-800 border-green-200"
                              : product.stock > 5
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {product.stock} adet
                        </Badge>
                      </TableCell>
                      <TableCell>{product.sales} adet</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            product.status === "active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {product.status === "active" ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Detayları Görüntüle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Düzenle
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
