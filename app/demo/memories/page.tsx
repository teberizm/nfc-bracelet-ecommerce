"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Clock, Play, Pause, Volume2, VolumeX, Star, BookOpen, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DemoMemoriesPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Demo data
  const demoImages = [
    {
      id: "1",
      title: "Aile Albümü",
      content: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=800&fit=crop",
      date: "1990",
    },
    {
      id: "2",
      title: "Mezuniyet Günü",
      content: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      date: "2005",
    },
    {
      id: "3",
      title: "İlk Araba",
      content: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
      date: "2008",
    },
    {
      id: "4",
      title: "Düğün Günü",
      content: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
      date: "2012",
    },
    {
      id: "5",
      title: "İlk Evimiz",
      content: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
      date: "2013",
    },
    {
      id: "6",
      title: "Bebeğimiz",
      content: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop",
      date: "2015",
    },
    {
      id: "7",
      title: "Aile Tatili",
      content: "https://images.unsplash.com/photo-1602002418082-dd4e5f7fb7b2?w=800&h=600&fit=crop",
      date: "2018",
    },
    {
      id: "8",
      title: "Yeni İş",
      content: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
      date: "2020",
    },
    {
      id: "9",
      title: "Yeni Ev",
      content: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop",
      date: "2022",
    },
    {
      id: "10",
      title: "Aile Buluşması",
      content: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      date: "2024",
    },
  ]

  const demoTexts = [
    {
      id: "t1",
      title: "Anılar Defteri",
      content:
        "Hayat bir anılar koleksiyonu gibi. Her bir anı, zamanın akışında bir damla. Bazen tatlı, bazen acı... Ama hepsi bizim hikayemizin bir parçası. Bu anıları saklamak, onları yaşatmak, gelecek nesillere aktarmak... İşte hayatın gerçek zenginliği burada.",
    },
    {
      id: "t2",
      title: "Zaman Tüneli",
      content:
        "Geçmişe baktığımda, her bir anın ne kadar değerli olduğunu anlıyorum. O zamanlar önemsiz gibi görünen küçük detaylar, şimdi en değerli hazinelerim. Bir gülüş, bir dokunuş, bir söz... Hepsi zamanın tozlu raflarında birer mücevher gibi parlıyor.",
    },
    {
      id: "t3",
      title: "Aile Mirası",
      content:
        "Büyükbabamın saati, anneannemin yüzüğü, babamın kitapları... Her biri bir hikaye anlatıyor. Her biri geçmişten geleceğe uzanan bir köprü. Bu mirasın bir parçası olmak, bu hikayeleri yaşatmak ve yeni hikayeler eklemek... İşte benim görevim bu.",
    },
    {
      id: "t4",
      title: "Nostaljik Anlar",
      content:
        "Eski fotoğraflara bakarken, o günlere geri dönüyorum. O zamanki heyecanı, mutluluğu, bazen de hüznü yeniden yaşıyorum. Zaman ne kadar hızlı geçiyor, ama anılar hep taze kalıyor. Her bir anı, ruhuma işlenmiş birer iz.",
    },
  ]

  const demoVideos = [
    {
      id: "v1",
      title: "Aile Videoları - 1995",
      content: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    },
    {
      id: "v2",
      title: "Düğün Videosu - 2012",
      content: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    },
  ]

  const demoAudios = [
    {
      id: "a1",
      title: "Büyükbabamın Sesi - 1980",
      content: "https://www.soundjay.com/human/sounds/man-laughing-1.mp3",
    },
    {
      id: "a2",
      title: "Çocukluk Şarkım",
      content: "https://www.soundjay.com/human/sounds/whistling-1.mp3",
    },
  ]

  // Kapak fotoğrafı (ilk fotoğraf)
  const coverPhoto = demoImages[0]
  const remainingImages = demoImages.slice(1)

  // Otomatik düzen oluşturma fonksiyonu
  const createAutoLayout = () => {
    const sections = []
    let imageIndex = 0
    let textIndex = 0
    let videoIndex = 0
    let audioIndex = 0

    // Döngü: 6 foto → yazılar → video → müzik
    while (
      imageIndex < remainingImages.length ||
      textIndex < demoTexts.length ||
      videoIndex < demoVideos.length ||
      audioIndex < demoAudios.length
    ) {
      // 6 fotoğraf ekle
      const currentImages = remainingImages.slice(imageIndex, imageIndex + 6)
      if (currentImages.length > 0) {
        sections.push({ type: "images", data: currentImages })
        imageIndex += 6
      }

      // Yazıları ekle (varsa)
      if (textIndex < demoTexts.length) {
        const currentTexts = demoTexts.slice(textIndex, textIndex + 2) // Her seferinde 2 yazı
        sections.push({ type: "texts", data: currentTexts })
        textIndex += 2
      }

      // Video ekle (varsa)
      if (videoIndex < demoVideos.length) {
        sections.push({ type: "video", data: demoVideos[videoIndex] })
        videoIndex += 1
      }

      // Müzik ekle (varsa)
      if (audioIndex < demoAudios.length) {
        sections.push({ type: "audio", data: demoAudios[audioIndex] })
        audioIndex += 1
      }
    }

    return sections
  }

  const layoutSections = createAutoLayout()

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 215, 0, 0.8) 0%, 
            rgba(255, 165, 0, 0.7) 50%, 
            rgba(210, 105, 30, 0.8) 100%),
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
        }}
      />

      {/* Floating Stars Animation */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(15)].map((_, i) => (
          <Star
            key={i}
            className={`absolute animate-pulse ${
              i % 3 === 0 ? "text-yellow-300" : i % 3 === 1 ? "text-amber-300" : "text-amber-200"
            }`}
            style={{
              left: `${10 + ((i * 7) % 80)}%`,
              top: `${10 + ((i * 13) % 80)}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + (i % 3)}s`,
              transform: `translateY(${scrollY * (0.1 + (i % 3) * 0.05)}px) scale(${0.4 + (i % 4) * 0.2}) rotate(${
                (scrollY * 0.1 + i * 30) % 360
              }deg)`,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              opacity: 0.6 + Math.sin(scrollY * 0.01 + i) * 0.4,
            }}
            size={12 + (i % 4) * 8}
          />
        ))}
      </div>

      {/* Clock Effects */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(8)].map((_, i) => (
          <Clock
            key={i}
            className="absolute text-amber-600 animate-spin"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
            size={8 + Math.random() * 12}
          />
        ))}
      </div>

      <div className="relative z-20">
        {/* Hero Section - Cover Photo */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            {/* Cover Photo with Vintage Frame */}
            <div className="relative mb-8">
              <div
                className="w-80 h-80 mx-auto overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-105"
                style={{
                  background: "linear-gradient(45deg, rgba(139, 69, 19, 0.8), rgba(160, 82, 45, 0.7))",
                  border: "15px solid",
                  borderImage: "linear-gradient(45deg, #8B4513, #A0522D) 1",
                  boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                }}
              >
                <Image
                  src={coverPhoto.content || "/placeholder.svg"}
                  alt="Kapak Fotoğrafı"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover sepia"
                />
              </div>

              {/* Vintage Date Effect */}
              <div className="absolute -bottom-4 right-1/2 transform translate-x-1/2 bg-amber-800 text-amber-100 px-4 py-1 rounded-md shadow-lg">
                <p className="font-serif">{coverPhoto.date}</p>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 blur-xl animate-pulse" />
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce mt-12">
              <ChevronDown className="h-8 w-8 text-white/70 mx-auto" />
              <p
                className="text-white/70 text-sm mt-2 font-serif"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                Anıları Keşfet
              </p>
            </div>
          </div>
        </section>

        {/* Title Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="transform transition-all duration-1000">
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-amber-700/30 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">📜</span>
                  </div>
                  <h2
                    className="text-2xl font-bold text-white mb-2 font-serif"
                    style={{
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)",
                    }}
                  >
                    GOLDEN
                  </h2>
                </div>

                <div className="flex flex-col items-center">
                  <BookOpen className="h-12 w-12 text-amber-300 animate-pulse mb-2" />
                  <span
                    className="text-white/80 text-lg font-medium font-serif"
                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                  >
                    MEMORIES
                  </span>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-amber-700/30 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">📸</span>
                  </div>
                  <h2
                    className="text-2xl font-bold text-white mb-2 font-serif"
                    style={{
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)",
                    }}
                  >
                    TIMELESS
                  </h2>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p
                  className="text-white text-lg leading-relaxed font-serif"
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  "Anılar solmayan çiçeklerdir, zaman onları soldursa da kalplerimizde hep taze kalırlar."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Content Sections */}
        {layoutSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              {/* Images Section */}
              {section.type === "images" && (
                <>
                  <h3
                    className="text-4xl font-bold text-center text-white mb-16 font-serif"
                    style={{
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.4)",
                    }}
                  >
                    {sectionIndex === 0 ? "ZAMAN TÜNELİ" : "HAYATIN İZLERİ"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.data.map((image, index) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                        style={{
                          background: "linear-gradient(45deg, rgba(139, 69, 19, 0.8), rgba(160, 82, 45, 0.7))",
                          border: "10px solid",
                          borderImage: "linear-gradient(45deg, #8B4513, #A0522D) 1",
                          boxShadow: "0 0 15px rgba(0,0,0,0.4)",
                        }}
                      >
                        <Image
                          src={image.content || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110 sepia group-hover:sepia-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p
                            className="font-medium text-sm font-serif"
                            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9)" }}
                          >
                            {image.title}
                          </p>
                          <p className="text-xs text-amber-200" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9)" }}>
                            {image.date}
                          </p>
                        </div>

                        {/* Vintage Date Stamp */}
                        <div className="absolute top-2 right-2 bg-amber-800/70 text-amber-100 px-2 py-1 rounded text-xs font-serif">
                          {image.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Texts Section */}
              {section.type === "texts" && (
                <>
                  <h4
                    className="text-3xl font-bold text-center text-white mb-12 font-serif"
                    style={{
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                    }}
                  >
                    HATIRA DEFTERİ
                  </h4>
                  <div className="space-y-8">
                    {section.data.map((text, index) => (
                      <div key={text.id} className={`max-w-2xl ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`}>
                        <Card
                          className="border-amber-700/30 border-2"
                          style={{
                            background:
                              "url('/placeholder.svg?height=400&width=600&text=📜+Old+Paper+Texture') center/cover",
                          }}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-700 to-yellow-600 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h5
                                  className="font-semibold text-amber-900 mb-2 font-serif"
                                  style={{
                                    textShadow: "1px 1px 2px rgba(255,255,255,0.5)",
                                  }}
                                >
                                  {text.title}
                                </h5>
                                <p
                                  className="text-amber-950 leading-relaxed font-serif"
                                  style={{ textShadow: "1px 1px 2px rgba(255,255,255,0.3)" }}
                                >
                                  {text.content}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Video Section */}
              {section.type === "video" && (
                <>
                  <h4
                    className="text-3xl font-bold text-center text-white mb-12 font-serif"
                    style={{
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                    }}
                  >
                    HAREKETLI ANILAR
                  </h4>
                  <div className="max-w-2xl mx-auto">
                    <div
                      className="overflow-hidden"
                      style={{
                        background: "linear-gradient(45deg, rgba(139, 69, 19, 0.8), rgba(160, 82, 45, 0.7))",
                        border: "10px solid",
                        borderImage: "linear-gradient(45deg, #8B4513, #A0522D) 1",
                        boxShadow: "0 0 15px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div className="aspect-video bg-gradient-to-br from-amber-200 to-yellow-200 flex items-center justify-center">
                        <div className="text-center">
                          <Calendar className="h-16 w-16 text-amber-800 mx-auto mb-4" />
                          <p
                            className="text-amber-800 font-medium font-serif"
                            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                          >
                            {section.data.title}
                          </p>
                          <p
                            className="text-amber-700 text-sm font-serif"
                            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                          >
                            Video oynatıcı burada olacak
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-amber-800/80">
                        <p
                          className="text-amber-100 font-medium font-serif"
                          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                        >
                          {section.data.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Audio Section */}
              {section.type === "audio" && (
                <>
                  <h4
                    className="text-3xl font-bold text-center text-white mb-12 font-serif"
                    style={{
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                    }}
                  >
                    GEÇMIŞIN SESLERI
                  </h4>
                  <div className="max-w-md mx-auto">
                    <Card className="bg-white/15 backdrop-blur-md border-amber-700/30 border-2">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-700 to-yellow-600 text-white hover:from-amber-800 hover:to-yellow-700"
                          >
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                          </Button>
                          <div className="flex-1 text-left">
                            <p
                              className="font-medium text-white font-serif"
                              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                            >
                              {section.data.title}
                            </p>
                            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full w-1/3 transition-all duration-300"></div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white hover:bg-white/10"
                          >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </section>
        ))}

        {/* Footer */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-amber-700/30">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Clock className="h-8 w-8 text-yellow-300 animate-spin" />
                <span className="text-3xl" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                  📜
                </span>
                <Clock className="h-8 w-8 text-yellow-300 animate-spin" />
              </div>
              <h3
                className="text-2xl font-bold text-white mb-4 font-serif"
                style={{
                  textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                }}
              >
                ZAMANSIZ ANILAR
              </h3>
              <p className="text-white/80 mb-6 font-serif" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                Geçmiş gider ama anılar kalır. Değerli anılarınızı sonsuza dek saklayın.
              </p>
              <Badge className="bg-gradient-to-r from-amber-700 to-yellow-600 text-white border-0 px-6 py-2 font-serif">
                ✨ NFC Anı Bilekliği ile Paylaşıldı
              </Badge>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
