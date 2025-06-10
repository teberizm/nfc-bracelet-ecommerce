"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, ArrowUpDown, Eye, Edit, MoreHorizontal, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAdmin } from "@/contexts/admin-context"

// Mock NFC içerik verileri
const mockNFCContent = [
  {
    id: "nfc-1",
    orderId: "order-1",
    orderNumber: "ORD-2024-001",
    customerName: "Ahmet Yılmaz",
    customerEmail: "ahmet@example.com",
    productName: "Premium NFC Deri Bileklik",
    theme: "Aşk",
    status: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
    content: {
      name: "Ahmet & Ayşe",
      message: "Sonsuz aşkımızın simgesi",
      photo: "/placeholder.svg?height=200&width=200",
      socialLinks: {
        instagram: "@ahmet_ayse",
        whatsapp: "+90 555 123 4567",
      },
    },
  },
  {
    id: "nfc-2",
    orderId: "order-2",
    orderNumber: "ORD-2024-002",
    customerName: "Mehmet Kaya",
    customerEmail: "mehmet@example.com",
    productName: "Spor NFC Silikon Bileklik",
    theme: "Adventure",
    status: "pending",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
    content: {
      name: "Mehmet Kaya",
      message: "Macera dolu hayatım",
      photo: null,
      socialLinks: {
        instagram: "@mehmet_adventure",
        linkedin: "mehmet-kaya",
      },
    },
  },
  {
    id: "nfc-3",
    orderId: "order-3",
    orderNumber: "ORD-2024-003",
    customerName: "Zeynep Şahin",
    customerEmail: "zeynep@example.com",
    productName: "Lüks NFC Metal Bileklik",
    theme: "Aşk",
    status: "in_progress",
    createdAt: "2024-01-18T16:20:00Z",
    updatedAt: "2024-01-19T10:30:00Z",
    content: {
      name: "Zeynep & Can",
      message: "Birlikte geçirdiğimiz her an değerli",
      photo: "/placeholder.svg?height=200&width=200",
      socialLinks: {
        instagram: "@zeynep_can",
        facebook: "zeynep.sahin",
      },
    },
  },
]

export default function AdminNFCContentPage() {
  const { state } = useAdmin()
  const router = useRouter()
  const [nfcContent, setNfcContent] = useState(mockNFCContent)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [themeFilter, setThemeFilter] = useState("all")
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
  const filteredContent = nfcContent.filter((content) => {
    const matchesSearch =
      content.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.content.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || content.status === statusFilter
    const matchesTheme = themeFilter === "all" || content.theme === themeFilter

    return matchesSearch && matchesStatus && matchesTheme
  })

  // Sıralama
  const sortedContent = [...filteredContent].sort((a, b) => {
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

  // Durum badge'i
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            İşleniyor
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
          <h1 className="text-3xl font-bold">NFC İçerik Yönetimi</h1>
          <p className="text-gray-600">Müşteri NFC içeriklerini yönetin</p>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="İçerik ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

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
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="in_progress">İşleniyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
              </SelectContent>
            </Select>

            {/* Tema Filtresi */}
            <Select value={themeFilter} onValueChange={setThemeFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Tema" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Temalar</SelectItem>
                <SelectItem value="Aşk">Aşk</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* İçerik Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>NFC İçerikleri ({filteredContent.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("orderNumber")}>
                    <div className="flex items-center gap-1">
                      Sipariş
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("customerName")}>
                    <div className="flex items-center gap-1">
                      Müşteri
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>İçerik</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("theme")}>
                    <div className="flex items-center gap-1">
                      Tema
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                    <div className="flex items-center gap-1">
                      Durum
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("updatedAt")}>
                    <div className="flex items-center gap-1">
                      Son Güncelleme
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      İçerik bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{content.orderNumber}</p>
                          <p className="text-sm text-gray-500">{content.productName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {content.customerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{content.customerName}</p>
                            <p className="text-sm text-gray-500">{content.customerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {content.content.photo && (
                            <Image
                              src={content.content.photo || "/placeholder.svg"}
                              alt="Content"
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{content.content.name}</p>
                            <p className="text-sm text-gray-500 max-w-xs truncate">{content.content.message}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{content.theme}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(content.status)}</TableCell>
                      <TableCell>
                        {new Date(content.updatedAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
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
                              <Link href={`/admin/nfc-content/${content.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Detayları Görüntüle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/nfc-content/${content.id}/edit`}>
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
