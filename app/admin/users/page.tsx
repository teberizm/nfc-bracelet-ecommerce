"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, RefreshCw, ShoppingBag, Calendar, User } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface UserType {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  total_orders: number
  total_spent: number
  is_active: boolean
}

export default function AdminUsersPage() {
  const { state } = useAdmin()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
  })

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchUsers()
    }
  }, [state.isAuthenticated, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Admin token bulunamadı")
        return
      }

      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)
      params.append("sortBy", filters.sortBy)
      params.append("sortOrder", filters.sortOrder)
      // Cache-busting için timestamp ekle
      params.append("t", Date.now().toString())

      console.log("API çağrısı yapılıyor:", `/api/admin/users?${params}`)

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API hatası:", response.status, errorText)
        throw new Error(`API hatası: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("API yanıtı:", data)

      if (data.success) {
        setUsers(data.users || [])
        toast.success("Kullanıcılar başarıyla yüklendi")
      } else {
        throw new Error(data.message || "Bilinmeyen hata")
      }
    } catch (error) {
      console.error("Kullanıcıları çekerken hata:", error)
      setError(`Kullanıcılar yüklenirken hata oluştu: ${error.message}`)
      toast.error("Kullanıcılar yüklenemedi")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Güvenli sayı formatlaması
  const formatNumber = (value: any): string => {
    const num = Number(value || 0)
    return isNaN(num) ? "0" : num.toLocaleString("tr-TR")
  }

  // Tarih formatlaması
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("tr-TR")
    } catch (error) {
      console.error("Tarih formatlanırken hata:", error)
      return "Geçersiz tarih"
    }
  }

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
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        <Button onClick={fetchUsers} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ad, soyad, email ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Kayıt Tarihi</SelectItem>
                <SelectItem value="total_spent">Toplam Harcama</SelectItem>
                <SelectItem value="total_orders">Sipariş Sayısı</SelectItem>
                <SelectItem value="first_name">Ad</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortOrder} onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Azalan</SelectItem>
                <SelectItem value="asc">Artan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hata Mesajı */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Kullanıcı Listesi */}
      <div className="grid gap-4">
        {users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {user.first_name} {user.last_name}
                        </h3>
                        {user.is_active ? (
                          <Badge variant="default">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4" />
                        <span>{formatNumber(user.total_orders)} sipariş</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatNumber(user.total_spent)} ₺</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                    <Button size="sm" className="mt-2" asChild>
                      <Link href={`/admin/users/${user.id}?t=${Date.now()}`}>Detay</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">
                {error ? "Hata nedeniyle kullanıcılar yüklenemedi." : "Henüz kullanıcı bulunmuyor."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
