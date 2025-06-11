"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"

interface Theme {
  id: string
  name: string
  slug: string
  description: string
  preview_image: string | null
  layout_config: {
    type: string
    colors: string[]
    layout: string
  }
  is_premium: boolean
  is_active: boolean
  download_count: number
  created_at: string
  updated_at: string
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTheme, setNewTheme] = useState({
    name: "",
    description: "",
    type: "love",
    colors: ["#ff69b4", "#ff1493"],
    layout: "romantic",
    is_premium: false,
  })

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/themes")
      const data = await response.json()

      if (data.success) {
        setThemes(data.themes)
      } else {
        toast.error("Temalar yüklenirken hata oluştu")
      }
    } catch (error) {
      console.error("Tema yükleme hatası:", error)
      toast.error("Temalar yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch =
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || theme.layout_config.type === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTheme = async () => {
    try {
      const response = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTheme),
      })

      const data = await response.json()

      if (data.success) {
        await fetchThemes()
        setIsCreateDialogOpen(false)
        setNewTheme({
          name: "",
          description: "",
          type: "love",
          colors: ["#ff69b4", "#ff1493"],
          layout: "romantic",
          is_premium: false,
        })
        toast.success("Tema başarıyla oluşturuldu")
      } else {
        toast.error(data.message || "Tema oluşturulurken hata oluştu")
      }
    } catch (error) {
      console.error("Tema oluşturma hatası:", error)
      toast.error("Tema oluşturulurken hata oluştu")
    }
  }

  const handleToggleStatus = async (themeId: string) => {
    try {
      const response = await fetch(`/api/admin/themes/${themeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status" }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchThemes()
        toast.success("Tema durumu güncellendi")
      } else {
        toast.error("Tema durumu güncellenirken hata oluştu")
      }
    } catch (error) {
      console.error("Tema güncelleme hatası:", error)
      toast.error("Tema durumu güncellenirken hata oluştu")
    }
  }

  const handleDeleteTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/admin/themes/${themeId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        await fetchThemes()
        toast.success("Tema silindi")
      } else {
        toast.error("Tema silinirken hata oluştu")
      }
    } catch (error) {
      console.error("Tema silme hatası:", error)
      toast.error("Tema silinirken hata oluştu")
    }
  }

  const handleDuplicateTheme = async (theme: Theme) => {
    try {
      const duplicatedTheme = {
        name: `${theme.name} (Kopya)`,
        description: theme.description,
        type: theme.layout_config.type,
        colors: theme.layout_config.colors,
        layout: theme.layout_config.layout,
        is_premium: theme.is_premium,
      }

      const response = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatedTheme),
      })

      const data = await response.json()

      if (data.success) {
        await fetchThemes()
        toast.success("Tema kopyalandı")
      } else {
        toast.error("Tema kopyalanırken hata oluştu")
      }
    } catch (error) {
      console.error("Tema kopyalama hatası:", error)
      toast.error("Tema kopyalanırken hata oluştu")
    }
  }

  const handlePreviewTheme = (theme: Theme) => {
    // Demo sayfasına yönlendir - tema tipine göre
    const demoUrl = `/demo/${theme.layout_config.type}`
    window.open(demoUrl, "_blank")
  }

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "love":
        return "bg-pink-100 text-pink-800"
      case "adventure":
        return "bg-green-100 text-green-800"
      case "memories":
        return "bg-yellow-100 text-yellow-800"
      case "minimal":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryText = (type: string) => {
    switch (type) {
      case "love":
        return "Aşk"
      case "adventure":
        return "Macera"
      case "memories":
        return "Anılar"
      case "minimal":
        return "Minimal"
      default:
        return type
    }
  }

  const getThemePreviewImage = (theme: Theme) => {
    switch (theme.layout_config.type) {
      case "love":
        return "/placeholder.svg?height=300&width=400&text=💕+Eternal+Love"
      case "adventure":
        return "/placeholder.svg?height=300&width=400&text=🏔️+Wild+Adventure"
      case "memories":
        return "/placeholder.svg?height=300&width=400&text=✨+Golden+Memories"
      default:
        return "/placeholder.svg?height=300&width=400&text=🎨+Theme"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tema Yönetimi</h1>
          <p className="text-gray-500">NFC içerik temalarını yönetin</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Tema
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Tema Oluştur</DialogTitle>
              <DialogDescription>Yeni bir NFC içerik teması oluşturun</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="themeName">Tema Adı</Label>
                <Input
                  id="themeName"
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  placeholder="Tema adını girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="themeDescription">Açıklama</Label>
                <Textarea
                  id="themeDescription"
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                  placeholder="Tema açıklamasını girin"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="themeType">Tema Tipi</Label>
                <select
                  id="themeType"
                  value={newTheme.type}
                  onChange={(e) => setNewTheme({ ...newTheme, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="love">Aşk</option>
                  <option value="adventure">Macera</option>
                  <option value="memories">Anılar</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Premium Tema</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={newTheme.is_premium}
                    onChange={(e) => setNewTheme({ ...newTheme, is_premium: e.target.checked })}
                  />
                  <Label htmlFor="isPremium">Bu tema premium olsun</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateTheme}>Oluştur</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tema ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="love">Aşk</option>
              <option value="adventure">Macera</option>
              <option value="memories">Anılar</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Themes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-3 bg-gray-200 animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <Card key={theme.id} className="overflow-hidden">
              <div className="relative">
                <Image
                  src={theme.preview_image || getThemePreviewImage(theme)}
                  alt={theme.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge className={getCategoryColor(theme.layout_config.type)}>
                    {getCategoryText(theme.layout_config.type)}
                  </Badge>
                  <Badge variant={theme.is_active ? "default" : "secondary"}>
                    {theme.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                  {theme.is_premium && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{theme.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {theme.layout_config.colors.map((color, index) => (
                      <div key={index} className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{theme.download_count} indirme</span>
                  <span>{new Date(theme.updated_at).toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/admin/themes/${theme.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Düzenle
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePreviewTheme(theme)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Önizle
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicateTheme(theme)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Kopyala
                  </Button>
                  <Button
                    variant={theme.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleStatus(theme.id)}
                  >
                    {theme.is_active ? "Pasifleştir" : "Aktifleştir"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTheme(theme.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredThemes.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Aradığınız kriterlere uygun tema bulunamadı.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
