"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, RefreshCw, Heart, Users, Music, Camera } from "lucide-react"
import Link from "next/link"

interface NFCContent {
  id: string
  order_id: string
  order_number: string
  theme: string
  first_name: string
  last_name: string
  email: string
  created_at: string
  content: any
}

const themeIcons = {
  love: Heart,
  family: Users,
  music: Music,
  memories: Camera,
}

const themeLabels = {
  love: "Aşk",
  family: "Aile",
  music: "Müzik",
  memories: "Anılar",
}

const themeColors = {
  love: "bg-pink-100 text-pink-800",
  family: "bg-blue-100 text-blue-800",
  music: "bg-purple-100 text-purple-800",
  memories: "bg-green-100 text-green-800",
}

export default function AdminNFCContentPage() {
  const { state } = useAdmin()
  const [nfcContent, setNfcContent] = useState<NFCContent[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    theme: "",
  })

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchNFCContent()
    }
  }, [state.isAuthenticated, filters])

  const fetchNFCContent = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      if (!token) return

      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)
      if (filters.theme) params.append("theme", filters.theme)

      const response = await fetch(`/api/admin/nfc-content?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setNfcContent(data.nfcContent)
      }
    } catch (error) {
      console.error("Error fetching NFC content:", error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold">NFC İçerik Yönetimi</h1>
        <Button onClick={fetchNFCContent} variant="outline">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Sipariş no, müşteri ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.theme} onValueChange={(value) => setFilters({ ...filters, theme: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tema seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Temalar</SelectItem>
                <SelectItem value="love">Aşk</SelectItem>
                <SelectItem value="family">Aile</SelectItem>
                <SelectItem value="music">Müzik</SelectItem>
                <SelectItem value="memories">Anılar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* NFC İçerik Listesi */}
      <div className="grid gap-4">
        {nfcContent.map((content) => {
          const ThemeIcon = themeIcons[content.theme as keyof typeof themeIcons] || Camera
          return (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <ThemeIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">#{content.order_number}</h3>
                        <Badge className={themeColors[content.theme as keyof typeof themeColors]}>
                          {themeLabels[content.theme as keyof typeof themeLabels] || content.theme}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {content.first_name} {content.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{content.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(content.created_at).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <Button size="sm" className="mt-2" asChild>
                      <Link href={`/admin/nfc-content/${content.id}`}>İncele</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {nfcContent.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filters.search || filters.theme
                ? "Arama kriterlerine uygun NFC içeriği bulunamadı."
                : "Henüz NFC içeriği bulunmuyor."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
