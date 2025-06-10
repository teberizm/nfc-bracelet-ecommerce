"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Upload,
  ImageIcon,
  Video,
  Music,
  FileText,
  X,
  ArrowLeft,
  Save,
  Mic,
  MicOff,
  Youtube,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useContent, type MediaContent } from "@/contexts/content-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface ContentUploadPageProps {
  params: {
    id: string
  }
}

interface TextItem {
  id: string
  title: string
  content: string
}

export default function ContentUploadPage({ params }: ContentUploadPageProps) {
  const { state: authState } = useAuth()
  const { state, dispatch, getOrderContent, uploadMedia } = useContent()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Çoklu metin için state
  const [textItems, setTextItems] = useState<TextItem[]>([{ id: "1", title: "", content: "" }])

  // Ses kaydı için state
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioTitle, setAudioTitle] = useState("")

  // YouTube müzik için state
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubeTitle, setYoutubeTitle] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const orderId = params.id
  const orderContent = getOrderContent(orderId)
  const order = authState.orders.find((o) => o.id === orderId)

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sipariş Bulunamadı</h1>
          <Button asChild>
            <Link href="/profile">Profilime Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleFileUpload = async (files: FileList | null, type: MediaContent["type"]) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const title = file.name.split(".")[0]

        // Progress simulation
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 100)

        await uploadMedia(orderId, file, type, title)

        clearInterval(progressInterval)
        setUploadProgress(100)

        toast({
          title: "Dosya Yüklendi!",
          description: `${file.name} başarıyla yüklendi.`,
        })
      }
    } catch (error) {
      toast({
        title: "Yükleme Hatası",
        description: "Dosya yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Çoklu metin ekleme fonksiyonları
  const addTextItem = () => {
    const newId = Date.now().toString()
    setTextItems([...textItems, { id: newId, title: "", content: "" }])
  }

  const removeTextItem = (id: string) => {
    if (textItems.length > 1) {
      setTextItems(textItems.filter((item) => item.id !== id))
    }
  }

  const updateTextItem = (id: string, field: "title" | "content", value: string) => {
    setTextItems(textItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSaveAllTexts = () => {
    const validTexts = textItems.filter((item) => item.title.trim() && item.content.trim())

    if (validTexts.length === 0) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen en az bir metin başlığı ve içeriği doldurun.",
        variant: "destructive",
      })
      return
    }

    validTexts.forEach((textItem) => {
      const mediaItem: MediaContent = {
        id: Date.now().toString() + Math.random(),
        type: "text",
        title: textItem.title,
        content: textItem.content,
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: "ADD_MEDIA_ITEM", payload: { orderId, item: mediaItem } })
    })

    // Form'u temizle
    setTextItems([{ id: "1", title: "", content: "" }])

    toast({
      title: "Metinler Eklendi!",
      description: `${validTexts.length} metin içeriği başarıyla eklendi.`,
    })
  }

  // Ses kaydı fonksiyonları
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setRecordedAudio(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Kayıt süresini takip et
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      toast({
        title: "Mikrofon Hatası",
        description: "Mikrofon erişimi reddedildi.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const saveRecording = () => {
    if (!recordedAudio || !audioTitle.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen ses kaydı başlığını girin.",
        variant: "destructive",
      })
      return
    }

    const audioUrl = URL.createObjectURL(recordedAudio)
    const mediaItem: MediaContent = {
      id: Date.now().toString(),
      type: "audio",
      title: audioTitle,
      content: audioUrl,
      duration: recordingTime,
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: "ADD_MEDIA_ITEM", payload: { orderId, item: mediaItem } })

    // Temizle
    setRecordedAudio(null)
    setAudioTitle("")
    setRecordingTime(0)

    toast({
      title: "Ses Kaydı Eklendi!",
      description: "Ses kaydınız başarıyla eklendi.",
    })
  }

  // YouTube müzik ekleme
  const handleYouTubeAdd = () => {
    if (!youtubeUrl.trim() || !youtubeTitle.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen YouTube linki ve başlık girin.",
        variant: "destructive",
      })
      return
    }

    // YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(youtubeUrl)) {
      toast({
        title: "Geçersiz Link",
        description: "Lütfen geçerli bir YouTube linki girin.",
        variant: "destructive",
      })
      return
    }

    const mediaItem: MediaContent = {
      id: Date.now().toString(),
      type: "audio",
      title: youtubeTitle,
      content: youtubeUrl,
      thumbnail: `https://img.youtube.com/vi/${extractYouTubeId(youtubeUrl)}/maxresdefault.jpg`,
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: "ADD_MEDIA_ITEM", payload: { orderId, item: mediaItem } })

    // Temizle
    setYoutubeUrl("")
    setYoutubeTitle("")

    toast({
      title: "YouTube Müziği Eklendi!",
      description: "Müzik başarıyla eklendi.",
    })
  }

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: "REMOVE_MEDIA_ITEM", payload: { orderId, itemId } })
    toast({
      title: "İçerik Silindi",
      description: "İçerik başarıyla silindi.",
    })
  }

  const handleContinueToTheme = () => {
    if (!orderContent || orderContent.mediaItems.length === 0) {
      toast({
        title: "İçerik Gerekli",
        description: "Tema seçimine geçmek için en az bir içerik eklemelisiniz.",
        variant: "destructive",
      })
      return
    }

    router.push(`/order/${orderId}/theme`)
  }

  const getMediaIcon = (type: MediaContent["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Profilime Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">İçerik Yükleme</h1>
            <p className="text-gray-600">Sipariş #{orderId} için içeriklerinizi ekleyin</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">İlerleme</span>
            <span className="text-sm text-gray-600">
              Adım 1/2: İçerik Yükleme{" "}
              {orderContent?.mediaItems.length ? `(${orderContent.mediaItems.length} öğe)` : ""}
            </span>
          </div>
          <Progress value={orderContent?.mediaItems.length ? 50 : 0} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Taraf - İçerik Yükleme */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="upload">Dosya Yükle</TabsTrigger>
                <TabsTrigger value="text">Metin Ekle</TabsTrigger>
                <TabsTrigger value="audio">Ses Kaydet</TabsTrigger>
                <TabsTrigger value="music">Müzik Linki</TabsTrigger>
                <TabsTrigger value="manage">Yönet</TabsTrigger>
              </TabsList>

              {/* Dosya Yükleme */}
              <TabsContent value="upload">
                <div className="space-y-6">
                  {/* Görsel Yükleme */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Fotoğraf Yükle
                      </CardTitle>
                      <CardDescription>JPG, PNG formatlarında fotoğraflarınızı yükleyin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.multiple = true
                          input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, "image")
                          input.click()
                        }}
                      >
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Fotoğraf seçin veya sürükleyin</p>
                        <p className="text-gray-600">Birden fazla fotoğraf seçebilirsiniz</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Video Yükleme */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Video Yükle
                      </CardTitle>
                      <CardDescription>MP4, MOV formatlarında videolarınızı yükleyin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "video/*"
                          input.multiple = true
                          input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, "video")
                          input.click()
                        }}
                      >
                        <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Video seçin veya sürükleyin</p>
                        <p className="text-gray-600">Maksimum 100MB boyutunda</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ses Dosyası Yükleme */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5" />
                        Ses Dosyası Yükle
                      </CardTitle>
                      <CardDescription>MP3, WAV formatlarında hazır ses dosyalarınızı yükleyin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "audio/*"
                          input.multiple = true
                          input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, "audio")
                          input.click()
                        }}
                      >
                        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Ses dosyası seçin</p>
                        <p className="text-gray-600">Müzik, ses mesajı veya kayıt</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Çoklu Metin Ekleme */}
              <TabsContent value="text">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Metin İçerikleri Ekle
                    </CardTitle>
                    <CardDescription>Özel mesajlarınızı, notlarınızı veya hikayelerinizi ekleyin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {textItems.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Metin {index + 1}</h4>
                          {textItems.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTextItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`textTitle-${item.id}`}>Başlık</Label>
                          <Input
                            id={`textTitle-${item.id}`}
                            placeholder="Örn: Sevgilime Mesaj, Anı Defteri..."
                            value={item.title}
                            onChange={(e) => updateTextItem(item.id, "title", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`textContent-${item.id}`}>İçerik</Label>
                          <Textarea
                            id={`textContent-${item.id}`}
                            placeholder="Mesajınızı, hikayenizi veya özel notlarınızı buraya yazın..."
                            value={item.content}
                            onChange={(e) => updateTextItem(item.id, "content", e.target.value)}
                            rows={6}
                          />
                          <p className="text-sm text-gray-600">{item.content.length}/1000 karakter</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <Button onClick={addTextItem} variant="outline" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Metin Ekle
                      </Button>
                      <Button onClick={handleSaveAllTexts} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Tüm Metinleri Kaydet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ses Kaydı */}
              <TabsContent value="audio">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Ses Kaydı Yap
                    </CardTitle>
                    <CardDescription>Anlık ses kaydı yapın ve ekleyin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Kayıt Kontrolleri */}
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center relative">
                        {isRecording && (
                          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={isRecording ? stopRecording : startRecording}
                          className="w-20 h-20 rounded-full bg-white text-red-500 hover:bg-gray-100 relative z-10"
                        >
                          {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          {isRecording ? "Kayıt Yapılıyor..." : "Kayıt Yapmaya Hazır"}
                        </p>
                        <p className="text-2xl font-mono text-red-500">{formatRecordingTime(recordingTime)}</p>
                      </div>
                    </div>

                    {/* Kayıt Önizleme */}
                    {recordedAudio && (
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium">Kayıt Önizleme</h4>
                        <audio src={URL.createObjectURL(recordedAudio)} controls className="w-full" />

                        <div className="space-y-2">
                          <Label htmlFor="audioTitle">Kayıt Başlığı</Label>
                          <Input
                            id="audioTitle"
                            placeholder="Örn: Sevgilime Ses Mesajı, Doğum Günü Kutlaması..."
                            value={audioTitle}
                            onChange={(e) => setAudioTitle(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              setRecordedAudio(null)
                              setAudioTitle("")
                              setRecordingTime(0)
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            İptal Et
                          </Button>
                          <Button onClick={saveRecording} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            Kaydı Ekle
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* YouTube Müzik Linki */}
              <TabsContent value="music">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-red-500" />
                      Etiket Okutulduğunda Çalacak Şarkı (İsteğe Bağlı)
                    </CardTitle>
                    <CardDescription>
                      YouTube'dan özel şarkınızın linkini ekleyin. NFC etiket okutulduğunda bu şarkı otomatik çalacak.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtubeTitle">Şarkı Adı</Label>
                      <Input
                        id="youtubeTitle"
                        placeholder="Örn: Ed Sheeran - Perfect, Bizim Şarkımız..."
                        value={youtubeTitle}
                        onChange={(e) => setYoutubeTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="youtubeUrl">YouTube Linki</Label>
                      <Input
                        id="youtubeUrl"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                      />
                      <p className="text-sm text-gray-600">YouTube'dan şarkının linkini kopyalayıp buraya yapıştırın</p>
                    </div>

                    <Button onClick={handleYouTubeAdd} className="w-full">
                      <Youtube className="h-4 w-4 mr-2" />
                      YouTube Müziği Ekle
                    </Button>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Music className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">💡 İpucu:</p>
                          <p>
                            Bu özellik sayesinde sevdikleriniz NFC bilekliği telefonlarına yaklaştırdığında özel
                            şarkınız otomatik olarak çalmaya başlayacak!
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* İçerik Yönetimi */}
              <TabsContent value="manage">
                <Card>
                  <CardHeader>
                    <CardTitle>İçerik Yönetimi</CardTitle>
                    <CardDescription>Yüklediğiniz içerikleri düzenleyin veya silin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!orderContent || orderContent.mediaItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p>Henüz içerik eklenmedi</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orderContent.mediaItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getMediaIcon(item.type)}
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-gray-600">
                                  {item.type === "text"
                                    ? `${item.content.length} karakter`
                                    : item.duration
                                      ? formatDuration(item.duration)
                                      : item.type === "audio" && item.content.includes("youtube")
                                        ? "YouTube Müzik"
                                        : "Medya dosyası"}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {item.type === "image"
                                  ? "Fotoğraf"
                                  : item.type === "video"
                                    ? "Video"
                                    : item.type === "audio"
                                      ? "Ses"
                                      : "Metin"}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sağ Taraf - Özet ve Devam */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Sipariş Özeti */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sipariş Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        width={50}
                        height={50}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-600">{item.quantity} adet</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* İçerik Durumu */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">İçerik Durumu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Toplam İçerik:</span>
                      <Badge variant="secondary">{orderContent?.mediaItems.length || 0}</Badge>
                    </div>
                    <div className="space-y-2">
                      {["image", "video", "audio", "text"].map((type) => {
                        const count = orderContent?.mediaItems.filter((item) => item.type === type).length || 0
                        return (
                          <div key={type} className="flex items-center justify-between text-sm">
                            <span className="capitalize">
                              {type === "image"
                                ? "Fotoğraf"
                                : type === "video"
                                  ? "Video"
                                  : type === "audio"
                                    ? "Ses"
                                    : "Metin"}
                              :
                            </span>
                            <span>{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Devam Butonu */}
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={handleContinueToTheme} className="w-full" size="lg">
                    Tema Seçimine Geç
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    En az bir içerik ekledikten sonra tema seçimine geçebilirsiniz
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Yükleme Progress */}
        {isUploading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Upload className="h-12 w-12 text-blue-600 mx-auto animate-pulse" />
                  <div>
                    <p className="font-medium">Dosya Yükleniyor...</p>
                    <p className="text-sm text-gray-600">Lütfen bekleyin</p>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-gray-600">{uploadProgress}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
