"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useAdmin } from "@/contexts/admin-context"
import { toast } from "@/hooks/use-toast"

// Mock sipariş verileri
const mockOrders = [
  {
    id: "order-1",
    orderNumber: "ORD-2024-001",
    customerName: "Ahmet Yılmaz",
    customerEmail: "ahmet@example.com",
    customerPhone: "+90 555 123 4567",
    date: "2024-01-15T10:30:00Z",
    total: 299,
    status: "pending",
    paymentStatus: "paid",
    items: [
      {
        productName: "Premium NFC Deri Bileklik",
        quantity: 1,
        price: 299,
        nfcEnabled: true,
      },
    ],
  },
  {
    id: "order-2",
    orderNumber: "ORD-2024-002",
    customerName: "Ayşe Demir",
    customerEmail: "ayse@example.com",
    customerPhone: "+90 555 987 6543",
    date: "2024-01-16T14:45:00Z",
    total: 398,
    status: "processing",
    paymentStatus: "paid",
    items: [
      {
        productName: "Spor NFC Silikon Bileklik",
        quantity: 2,
        price: 199,
        nfcEnabled: true,
      },
    ],
  },
  {
    id: "order-3",
    orderNumber: "ORD-2024-003",
    customerName: "Mehmet Kaya",
    customerEmail: "mehmet@example.com",
    customerPhone: "+90 555 456 7890",
    date: "2024-01-17T09:15:00Z",
    total: 499,
    status: "shipped",
    paymentStatus: "paid",
    items: [
      {
        productName: "Lüks NFC Metal Bileklik",
        quantity: 1,
        price: 499,
        nfcEnabled: true,
      },
    ],
  },
  {
    id: "order-4",
    orderNumber: "ORD-2024-004",
    customerName: "Zeynep Şahin",
    customerEmail: "zeynep@example.com",
    customerPhone: "+90 555 789 0123",
    date: "2024-01-18T16:20:00Z",
    total: 149,
    status: "completed",
    paymentStatus: "paid",
    items: [
      {
        productName: "Klasik Deri Bileklik",
        quantity: 1,
        price: 149,
        nfcEnabled: false,
      },
    ],
  },
  {
    id: "order-5",
    orderNumber: "ORD-2024-005",
    customerName: "Can Öztürk",
    customerEmail: "can@example.com",
    customerPhone: "+90 555 234 5678",
    date: "2024-01-19T11:05:00Z",
    total: 598,
    status: "failed",
    paymentStatus: "failed",
    items: [
      {
        productName: "Premium NFC Deri Bileklik",
        quantity: 2,
        price: 299,
        nfcEnabled: true,
      },
    ],
  },
]

export default function AdminOrdersPage() {
  const { state } = useAdmin()
  const router = useRouter()
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  }>({ key: "date", direction: "desc" })

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  // Filtreleme
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sıralama
  const sortedOrders = [...filteredOrders].sort((a, b) => {
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

  // Toplu işlem
  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "Seçim Yapılmadı",
        description: "Lütfen işlem yapmak için en az bir sipariş seçin.",
        variant: "destructive",
      })
      return
    }

    // Seçilen siparişleri güncelle
    const updatedOrders = orders.map((order) => {
      if (selectedOrders.includes(order.id)) {
        return { ...order, status: action }
      }
      return order
    })

    setOrders(updatedOrders)
    setSelectedOrders([])

    toast({
      title: "İşlem Başarılı",
      description: `${selectedOrders.length} sipariş güncellendi.`,
    })
  }

  // Tüm siparişleri seç/kaldır
  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    }
  }

  // Tekil sipariş seçimi
  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  // WhatsApp'a yönlendirme
  const openWhatsApp = (phone: string, orderNumber: string) => {
    const formattedPhone = phone.replace(/\s+/g, "")
    const message = `Merhaba, ${orderNumber} numaralı siparişiniz hakkında bilgi vermek istiyorum.`
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Sipariş durumu badge'i
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Onay Bekliyor
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            İşleniyor
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            <Truck className="h-3 w-3 mr-1" />
            Kargoya Verildi
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Başarısız
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
          <h1 className="text-3xl font-bold">Siparişler</h1>
          <p className="text-gray-600">Tüm siparişleri yönetin</p>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Sipariş ara..."
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
                  <SelectValue placeholder="Durum Filtresi" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Onay Bekliyor</SelectItem>
                <SelectItem value="processing">İşleniyor</SelectItem>
                <SelectItem value="shipped">Kargoya Verildi</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="failed">Başarısız</SelectItem>
              </SelectContent>
            </Select>

            {/* Toplu İşlemler */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={selectedOrders.length === 0}>
                    Toplu İşlem ({selectedOrders.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("processing")}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    İşleniyor olarak işaretle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("shipped")}>
                    <Truck className="h-4 w-4 mr-2" />
                    Kargoya verildi olarak işaretle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("completed")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tamamlandı olarak işaretle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sipariş Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Siparişler ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("orderNumber")}>
                    <div className="flex items-center gap-1">
                      Sipariş No
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("customerName")}>
                    <div className="flex items-center gap-1">
                      Müşteri
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("date")}>
                    <div className="flex items-center gap-1">
                      Tarih
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("total")}>
                    <div className="flex items-center gap-1">
                      Tutar
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                    <div className="flex items-center gap-1">
                      Durum
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Sipariş bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleSelectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>₺{order.total.toLocaleString("tr-TR")}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openWhatsApp(order.customerPhone, order.orderNumber)}
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
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
