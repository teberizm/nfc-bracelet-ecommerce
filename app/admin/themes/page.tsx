"use client"

import { useState } from "react"
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
  description: string
  category: "romantic" | "adventure" | "business" | "creative" | "minimal"
  preview: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

// Mock data
const mockThemes: Theme[] = [
  {
    id: "theme-1",
    name: "Aşk",
    description: "Romantik çiftler için özel tasarlanmış tema",
    category: "romantic",
    preview: "/placeholder.svg?height=300&width=400",
    backgroundColor: "#FFE4E6",
    textColor: "#BE185D",
    accentColor: "#F43F5E",
    fontFamily: "Inter",
    isActive: true,
    usageCount: 45,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "theme-2",
    name: "Adventure",
    description: "Macera severler için dinamik tema",
    category: "adventure",
    preview: "/placeholder.svg?height=300&width=400",
    backgroundColor: "#F0FDF4",
    textColor: "#166534",
    accentColor: "#22C55E",
    fontFamily: "Inter",
    isActive: true,
    usageCount: 32,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-16T11:20:00Z",
  },
  {
    id: "theme-3",
    name: "Business Pro",
    description: "Profesyonel iş dünyası için şık tema",
    category: "business",
    preview: "/placeholder.svg?height=300&width=400",
    backgroundColor: "#F8FAFC",
    textColor: "#1E293B",
    accentColor: "#3B82F6",
    fontFamily: "Inter",
    isActive: true,
    usageCount: 28,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "theme-4",
    name: "Creative",
    description: "Yaratıcı kişiler için renkli tema",
    category: "creative",
    preview: "/placeholder.svg?height=300&width=400",
    backgroundColor: "#FEF3C7",
    textColor: "#92400E",
    accentColor: "#F59E0B",
    fontFamily: "Inter",
    isActive: false,
    usageCount: 15,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-18T14:45:00Z",
  },
]

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>(mockThemes)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTheme, setNewTheme] = useState<Partial<Theme>>({
    name: "",
    description: "",
    category: "minimal",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    accentColor: "#3B82F6",
    fontFamily: "Inter",
    isActive: true,
  })

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch =
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || theme.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateTheme = () => {
    const theme: Theme = {
      id: `theme-${Date.now()}`,
      name: newTheme.name || "",
      description: newTheme.description || "",
      category: (newTheme.category as any) || "minimal",
      preview: "/placeholder.svg?height=300&width=400",
      backgroundColor: newTheme.backgroundColor || "#FFFFFF",
      textColor: newTheme.textColor || "#000000",
      accentColor: newTheme.accentColor || "#3B82F6",
      fontFamily: newTheme.fontFamily || "Inter",
      isActive: newTheme.isActive || true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setThemes([...themes, theme])
    setIsCreateDialogOpen(false)
    setNewTheme({
      name: "",
      description: "",
      category: "minimal",
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      accentColor: "#3B82F6",
      fontFamily: "Inter",
      isActive: true,
    })
    toast.success("Tema başarıyla oluşturuldu")
  }

  const handleToggleStatus = (themeId: string) => {
    setThemes(themes.map((theme) => (theme.id === themeId ? { ...theme, isActive: !theme.isActive } : theme)))
    toast.success("Tema durumu güncellendi")
  }

  const handleDeleteTheme = (themeId: string) => {
    setThemes(themes.filter((theme) => theme.id !== themeId))
    toast.success("Tema silindi")
  }

  const handleDuplicateTheme = (theme: Theme) => {
    const duplicatedTheme: Theme = {
      ...theme,
      id: `theme-${Date.now()}`,
      name: `${theme.name} (Kopya)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setThemes([...themes, duplicatedTheme])
    toast.success("Tema kopyalandı")
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "romantic":
        return "bg-pink-100 text-pink-800"
      case "adventure":
        return "bg-green-100 text-green-800"
      case "business":
        return "bg-blue-100 text-blue-800"
      case "creative":
        return "bg-yellow-100 text-yellow-800"
      case "minimal":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "romantic":
        return "Romantik"
      case "adventure":
        return "Macera"
      case "business":
        return "İş"
      case "creative":
        return "Yaratıcı"
      case "minimal":
        return "Minimal"
      default:
        return category
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
                <Label htmlFor="themeCategory">Kategori</Label>
                <select
                  id="themeCategory"
                  value={newTheme.category}
                  onChange={(e) => setNewTheme({ ...newTheme, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="romantic">Romantik</option>
                  <option value="adventure">Macera</option>
                  <option value="business">İş</option>
                  <option value="creative">Yaratıcı</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Arkaplan</Label>
                  <input
                    id="backgroundColor"
                    type="color"
                    value={newTheme.backgroundColor}
                    onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textColor">Metin</Label>
                  <input
                    id="textColor"
                    type="color"
                    value={newTheme.textColor}
                    onChange={(e) => setNewTheme({ ...newTheme, textColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Vurgu</Label>
                  <input
                    id="accentColor"
                    type="color"
                    value={newTheme.accentColor}
                    onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
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
              <option value="romantic">Romantik</option>
              <option value="adventure">Macera</option>
              <option value="business">İş</option>
              <option value="creative">Yaratıcı</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => (
          <Card key={theme.id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={theme.preview || "/placeholder.svg"}
                alt={theme.name}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge className={getCategoryColor(theme.category)}>{getCategoryText(theme.category)}</Badge>
                <Badge variant={theme.isActive ? "default" : "secondary"}>{theme.isActive ? "Aktif" : "Pasif"}</Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{theme.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.backgroundColor }} />
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.textColor }} />
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.accentColor }} />
                </div>
              </div>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{theme.usageCount} kullanım</span>
                <span>{new Date(theme.updatedAt).toLocaleDateString("tr-TR")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/admin/themes/${theme.id}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/nfc/demo?theme=${theme.id}`, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Önizle
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDuplicateTheme(theme)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Kopyala
                </Button>
                <Button
                  variant={theme.isActive ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleToggleStatus(theme.id)}
                >
                  {theme.isActive ? "Pasifleştir" : "Aktifleştir"}
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

      {filteredThemes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Aradığınız kriterlere uygun tema bulunamadı.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
