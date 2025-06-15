"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Mountain, Play, Pause, Volume2, VolumeX, Compass, Map, Camera, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DemoAdventurePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Demo data
  const demoImages = [
    {
      id: "1",
      title: "Dağ Zirvesi",
      content: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop",
    },
    {
      id: "2",
      title: "Orman Yürüyüşü",
      content: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    },
    {
      id: "3",
      title: "Kamp Alanı",
      content: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop",
    },
    {
      id: "4",
      title: "Göl Manzarası",
      content: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
    },
    {
      id: "5",
      title: "Kanyon Geçişi",
      content: "https://images.unsplash.com/photo-1475066392170-59d55d96fe51?w=800&h=600&fit=crop",
    },
    {
      id: "6",
      title: "Şelale",
      content: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&h=600&fit=crop",
    },
    {
      id: "7",
      title: "Dağ Bisikleti",
      content: "https://images.unsplash.com/photo-1594787314203-9c474b8938d9?w=800&h=600&fit=crop",
    },
    {
      id: "8",
      title: "Kayak Macerası",
      content: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    },
    {
      id: "9",
      title: "Kış Kampı",
      content: "https://images.unsplash.com/photo-1515444744559-7be63e1600de?w=800&h=600&fit=crop",
    },
    {
      id: "10",
      title: "Gün Batımı",
      content: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
    },
  ]

  const demoTexts = [
    {
      id: "t1",
      title: "Macera Günlüğü",
      content:
        "Bugün dağın zirvesine ulaştık! Sabah 5'te yola çıktık ve zorlu bir tırmanışın ardından muhteşem manzarayı gördük. Doğanın bu kadar etkileyici olabileceğini hiç düşünmemiştim. Her adımda yeni bir keşif, her molada yeni bir hikaye...",
    },
    {
      id: "t2",
      title: "Yolculuk Notları",
      content:
        "Bu yolculuk bana doğanın gücünü ve insanın ne kadar küçük olduğunu hatırlattı. Bazen kaybolmak, kendini bulmak için en iyi yoldur. Patikalar, nehirler, dağlar... Hepsi bize bir şeyler öğretiyor.",
    },
    {
      id: "t3",
      title: "Gelecek Rotalar",
      content:
        "Bir sonraki durağımız Himalayalar olacak. Dünyanın çatısına tırmanmak, bulutların üzerinde yürümek... Hayalini kurduğum bu macera için hazırlıklara başladık bile. Ekipmanlar, haritalar, eğitimler...",
    },
    {
      id: "t4",
      title: "Doğa Dersleri",
      content:
        "Doğada geçirdiğim her an bana hayatın gerçek değerlerini öğretiyor. Sabır, dayanıklılık, uyum sağlama... Bunlar sadece doğada değil, hayatın her alanında bize yol gösteren değerler.",
    },
  ]

  const demoVideos = [
    {
      id: "v1",
      title: "Dağ Tırmanışı",
      content: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop",
    },
    {
      id: "v2",
      title: "Rafting Macerası",
      content: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1530866495561-7a0517307231?w=400&h=300&fit=crop",
    },
  ]

  const demoAudios = [
    {
      id: "a1",
      title: "Doğa Sesleri - Orman",
      content: "https://www.soundjay.com/nature/sounds/rain-01.mp3",
    },
    {
      id: "a2",
      title: "Şelale Ambiyansı",
      content: "https://www.soundjay.com/nature/sounds/river-1.mp3",
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
            rgba(76, 175, 80, 0.9) 0%, 
            rgba(139, 195, 74, 0.8) 50%, 
            rgba(205, 220, 57, 0.9) 100%),
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
        }}
      />

      {/* Floating Mountains Animation */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(10)].map((_, i) => (
          <Mountain
            key={i}
            className={`absolute animate-pulse ${
              i % 3 === 0 ? "text-green-800" : i % 3 === 1 ? "text-green-700" : "text-green-600"
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

      {/* Compass Effects */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(8)].map((_, i) => (
          <Compass
            key={i}
            className="absolute text-yellow-600 animate-spin"
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
            {/* Cover Photo Circle */}
            <div className="relative mb-8">
              <div
                className="w-80 h-80 mx-auto rounded-full overflow-hidden shadow-2xl border-8 border-green-700/30 backdrop-blur-sm transition-transform duration-700 hover:scale-105"
                style={{
                  background: "linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))",
                }}
              >
                <Image
                  src={coverPhoto.content || "/placeholder.svg"}
                  alt="Kapak Fotoğrafı"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Compass Effect */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-green-600 flex items-center justify-center animate-bounce">
                <Compass className="h-8 w-8 text-white" />
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-yellow-400/20 blur-xl animate-pulse" />
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce mt-12">
              <ChevronDown className="h-8 w-8 text-white/70 mx-auto" />
              <p className="text-white/70 text-sm mt-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                Macera Başlıyor
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
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">🧗</span>
                  </div>
                  <h2
                    className="text-2xl font-bold text-white mb-2"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)",
                    }}
                  >
                    WILD ADVENTURE
                  </h2>
                </div>

                <div className="flex flex-col items-center">
                  <Compass className="h-12 w-12 text-yellow-300 animate-spin mb-2" />
                  <span
                    className="text-white/80 text-lg font-medium"
                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                  >
                    EXPLORE
                  </span>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">🏕️</span>
                  </div>
                  <h2
                    className="text-2xl font-bold text-white mb-2"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)",
                    }}
                  >
                    DISCOVER
                  </h2>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p
                  className="text-white text-lg leading-relaxed"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  "Hayat bir macera, her adım yeni bir keşif... Sınırlarını zorla, ufkunu genişlet!"
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
                    className="text-4xl font-bold text-center text-white mb-16"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.4)",
                    }}
                  >
                    {sectionIndex === 0 ? "MACERA KARELERI" : "DAHA FAZLA KEŞIF"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.data.map((image, index) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                      >
                        <Image
                          src={image.content || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="font-medium text-sm" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9)" }}>
                            {image.title}
                          </p>
                        </div>

                        {/* Floating Icons on Hover */}
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {[...Array(3)].map((_, i) => (
                            <Camera
                              key={i}
                              className="absolute text-green-300 animate-ping"
                              style={{
                                left: `${20 + i * 30}%`,
                                top: `${20 + i * 20}%`,
                                animationDelay: `${i * 0.2}s`,
                              }}
                              size={12}
                            />
                          ))}
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
                    className="text-3xl font-bold text-center text-white mb-12"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                    }}
                  >
                    MACERA NOTLARI
                  </h4>
                  <div className="space-y-8">
                    {section.data.map((text, index) => (
                      <div key={text.id} className={`max-w-2xl ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`}>
                        <Card className="bg-white/15 backdrop-blur-md border-white/20 border">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 flex items-center justify-center flex-shrink-0">
                                <Map className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h5
                                  className="font-semibold text-white mb-2"
                                  style={{
                                    fontFamily: "'Montserrat', sans-serif",
                                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                  }}
                                >
                                  {text.title}
                                </h5>
                                <p
                                  className="text-white/90 leading-relaxed"
                                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9)" }}
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
                    className="text-3xl font-bold text-center text-white mb-12"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                    }}
                  >
                    MACERA VIDEOLARI
                  </h4>
                  <div className="max-w-2xl mx-auto">
                    <div className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="aspect-video bg-gradient-to-br from-green-200 to-yellow-200 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="h-16 w-16 text-green-800 mx-auto mb-4" />
                          <p
                            className="text-green-800 font-medium"
                            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                          >
                            {section.data.title}
                          </p>
                          <p className="text-green-700 text-sm" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
                            Video oynatıcı burada olacak
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-white font-medium" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
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
                    className="text-3xl font-bold text-center text-white mb-12"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                    }}
                  >
                    DOĞA SESLERİ
                  </h4>
                  <div className="max-w-md mx-auto">
                    <Card className="bg-white/15 backdrop-blur-md border-white/20 border">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 text-white hover:from-green-700 hover:to-yellow-700"
                          >
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                          </Button>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-white" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                              {section.data.title}
                            </p>
                            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                              <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full w-1/3 transition-all duration-300"></div>
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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Mountain className="h-8 w-8 text-yellow-300 animate-pulse" />
                <span className="text-3xl" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                  🧭
                </span>
                <Mountain className="h-8 w-8 text-yellow-300 animate-pulse" />
              </div>
              <h3
                className="text-2xl font-bold text-white mb-4"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                }}
              >
                MACERA DEVAM EDİYOR
              </h3>
              <p className="text-white/80 mb-6" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                Her yolculuk bir adımla başlar. Bir sonraki macerada görüşmek üzere!
              </p>
              <Badge className="bg-gradient-to-r from-green-600 to-yellow-600 text-white border-0 px-6 py-2">
                🏔️ NFC Macera Bilekliği ile Paylaşıldı
              </Badge>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
