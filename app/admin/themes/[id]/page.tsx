"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Palette, Type, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Theme {
  id: string
  name: string
  description: string
  category: "romantic" | "adventure" | "business" | "creative" | "minimal"
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  fontSize: number
  borderRadius: number
  spacing: number
  isActive: boolean
  usageCount: number
  customCSS: string
  createdAt: string
  updatedAt: string
}

// Mock data
const mockTheme: Theme = {
  id: "theme-1",
  name: "Aşk",
  description: "Romantik çiftler için özel tasarlanmış tema",
  category: "romantic",
  backgroundColor: "#FFE4E6",
  textColor: "#BE185D",
  accentColor: "#F43F5E",
  fontFamily: "Inter",
  fontSize: 16,
  borderRadius: 8,
  spacing: 16,
  isActive: true,
  usageCount: 45,
  customCSS: `/* Özel CSS kodları */
.theme-container {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.theme-title {
  font-weight: 600;
  letter-spacing: -0.025em;
}`,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
}

export default function ThemeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>(mockTheme)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // API call simulation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
    toast.success("Tema güncellendi")
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{theme.name}</h1>
            <p className="text-gray-500">Tema Düzenleme</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open(`/nfc/demo?theme=${theme.id}`, "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            Önizle
          </Button>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Önizleme */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Canlı Önizleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="p-6 rounded-lg border-2 min-h-[300px]"
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  fontFamily: theme.fontFamily,
                  fontSize: `${theme.fontSize}px`,
                  borderRadius: `${theme.borderRadius}px`,
                }}
              >
                <div style={{ marginBottom: `${theme.spacing}px` }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: theme.accentColor }}>
                    Örnek Başlık
                  </h3>
                  <p className="mb-4">
                    Bu bir örnek metin içeriğidir. Tema renkleri ve tipografi ayarları burada görüntülenir.
                  </p>
                  <button
                    className="px-4 py-2 rounded font-medium"
                    style={{
                      backgroundColor: theme.accentColor,
                      color: theme.backgroundColor,
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    Örnek Buton
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Düzenleme Paneli */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Temel</TabsTrigger>
              <TabsTrigger value="colors">Renkler</TabsTrigger>
              <TabsTrigger value="typography">Tipografi</TabsTrigger>
              <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                  <CardDescription>Temanın temel özelliklerini düzenleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tema Adı</Label>
                    <Input
                      id="name"
                      value={theme.name}
                      onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={theme.description}
                      onChange={(e) => setTheme({ ...theme, description: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <select
                      id="category"
                      value={theme.category}
                      onChange={(e) => setTheme({ ...theme, category: e.target.value as any })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value="romantic">Romantik</option>
                      <option value="adventure">Macera</option>
                      <option value="business">İş</option>
                      <option value="creative">Yaratıcı</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Durum</span>
                    <Badge variant={theme.isActive ? "default" : "secondary"}>
                      {theme.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Kullanım Sayısı</span>
                    <span className="font-medium">{theme.usageCount}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Renk Paleti
                  </CardTitle>
                  <CardDescription>Tema renklerini özelleştirin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Arkaplan Rengi</Label>
                      <div className="flex gap-2">
                        <input
                          id="backgroundColor"
                          type="color"
                          value={theme.backgroundColor}
                          onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                          disabled={!isEditing}
                          className="w-12 h-10 border border-gray-300 rounded-md disabled:opacity-50"
                        />
                        <Input
                          value={theme.backgroundColor}
                          onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                          disabled={!isEditing}
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="textColor">Metin Rengi</Label>
                      <div className="flex gap-2">
                        <input
                          id="textColor"
                          type="color"
                          value={theme.textColor}
                          onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                          disabled={!isEditing}
                          className="w-12 h-10 border border-gray-300 rounded-md disabled:opacity-50"
                        />
                        <Input
                          value={theme.textColor}
                          onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                          disabled={!isEditing}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Vurgu Rengi</Label>
                      <div className="flex gap-2">
                        <input
                          id="accentColor"
                          type="color"
                          value={theme.accentColor}
                          onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                          disabled={!isEditing}
                          className="w-12 h-10 border border-gray-300 rounded-md disabled:opacity-50"
                        />
                        <Input
                          value={theme.accentColor}
                          onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                          disabled={!isEditing}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Renk Önerileri */}
                  <div className="space-y-3">
                    <Label>Hazır Renk Paletleri</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { name: "Romantik", bg: "#FFE4E6", text: "#BE185D", accent: "#F43F5E" },
                        { name: "Macera", bg: "#F0FDF4", text: "#166534", accent: "#22C55E" },
                        { name: "İş", bg: "#F8FAFC", text: "#1E293B", accent: "#3B82F6" },
                        { name: "Yaratıcı", bg: "#FEF3C7", text: "#92400E", accent: "#F59E0B" },
                      ].map((palette) => (
                        <button
                          key={palette.name}
                          onClick={() =>
                            isEditing &&
                            setTheme({
                              ...theme,
                              backgroundColor: palette.bg,
                              textColor: palette.text,
                              accentColor: palette.accent,
                            })
                          }
                          disabled={!isEditing}
                          className="p-3 rounded-lg border text-left hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex gap-1 mb-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.bg }} />
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.text }} />
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.accent }} />
                          </div>
                          <p className="text-sm font-medium">{palette.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Tipografi
                  </CardTitle>
                  <CardDescription>Yazı tipi ve boyut ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Yazı Tipi</Label>
                    <select
                      id="fontFamily"
                      value={theme.fontFamily}
                      onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Yazı Boyutu (px)</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={theme.fontSize}
                      onChange={(e) => setTheme({ ...theme, fontSize: Number(e.target.value) })}
                      disabled={!isEditing}
                      min="12"
                      max="24"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Gelişmiş Ayarlar
                  </CardTitle>
                  <CardDescription>Layout ve özel CSS ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="borderRadius">Köşe Yuvarlaklığı (px)</Label>
                    <Input
                      id="borderRadius"
                      type="number"
                      value={theme.borderRadius}
                      onChange={(e) => setTheme({ ...theme, borderRadius: Number(e.target.value) })}
                      disabled={!isEditing}
                      min="0"
                      max="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spacing">İç Boşluk (px)</Label>
                    <Input
                      id="spacing"
                      type="number"
                      value={theme.spacing}
                      onChange={(e) => setTheme({ ...theme, spacing: Number(e.target.value) })}
                      disabled={!isEditing}
                      min="8"
                      max="32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customCSS">Özel CSS</Label>
                    <Textarea
                      id="customCSS"
                      value={theme.customCSS}
                      onChange={(e) => setTheme({ ...theme, customCSS: e.target.value })}
                      disabled={!isEditing}
                      rows={8}
                      placeholder="/* Özel CSS kodlarınızı buraya yazın */"
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
