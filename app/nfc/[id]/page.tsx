"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Star,
  Music,
  FileText,
  ChevronDown,
  Mountain,
  Trophy,
  Award,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContent } from "@/contexts/content-context"

interface NFCPageProps {
  params: {
    id: string
  }
}

export default function NFCPage({ params }: NFCPageProps) {
  const { getOrderContent } = useContent()
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)
  const [selectedImageSlot, setSelectedImageSlot] = useState<number | null>(null)
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const orderId = params.id
  const orderContent = getOrderContent(orderId)

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Theme-specific animations
  useEffect(() => {
    if (!orderContent?.selectedTheme) return

    if (orderContent.selectedTheme.id === "love") {
      setShowHearts(true)
    } else if (orderContent.selectedTheme.id === "adventure") {
      setShowStars(true)
    } else if (orderContent.selectedTheme.id === "memories") {
      setShowSparkles(true)
    }
  }, [orderContent?.selectedTheme])

  // Audio/Video control
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  if (!orderContent || !orderContent.selectedTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <Card className="p-8 text-center max-w-md mx-4">
          <div className="mb-4">
            <Heart className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">İçerik Hazırlanıyor</h1>
          <p className="text-gray-600">Bu NFC bağlantısı henüz aktif değil veya içerik hazırlanıyor.</p>
        </Card>
      </div>
    )
  }

  const { selectedTheme, mediaItems } = orderContent

  // Organize content by type
  const images = mediaItems.filter((item) => item.type === "image")
  const videos = mediaItems.filter((item) => item.type === "video")
  const audios = mediaItems.filter((item) => item.type === "audio")
  const texts = mediaItems.filter((item) => item.type === "text")
  const youtubeLinks = mediaItems.filter((item) => item.type === "youtube")

  // Cover photo is the first image
  const coverPhoto = images[0]
  const remainingImages = images.slice(1)

  // Create automatic layout sections
  const createAutoLayout = () => {
    const sections = []
    let imageIndex = 0
    let textIndex = 0
    let videoIndex = 0
    let audioIndex = 0
    let youtubeIndex = 0

    // Loop: 6 photos → texts → video → audio → youtube → repeat
    while (
      imageIndex < remainingImages.length ||
      textIndex < texts.length ||
      videoIndex < videos.length ||
      audioIndex < audios.length ||
      youtubeIndex < youtubeLinks.length
    ) {
      // Add up to 6 images
      const currentImages = remainingImages.slice(imageIndex, imageIndex + 6)
      if (currentImages.length > 0) {
        sections.push({ type: "images", data: currentImages })
        imageIndex += 6
      }

      // Add texts (up to 2 at a time)
      if (textIndex < texts.length) {
        const currentTexts = texts.slice(textIndex, textIndex + 2)
        sections.push({ type: "texts", data: currentTexts })
        textIndex += 2
      }

      // Add a video
      if (videoIndex < videos.length) {
        sections.push({ type: "video", data: videos[videoIndex] })
        videoIndex += 1
      }

      // Add an audio
      if (audioIndex < audios.length) {
        sections.push({ type: "audio", data: audios[audioIndex] })
        audioIndex += 1
      }

      // Add a YouTube link
      if (youtubeIndex < youtubeLinks.length) {
        sections.push({ type: "youtube", data: youtubeLinks[youtubeIndex] })
        youtubeIndex += 1
      }
    }

    return sections
  }

  const layoutSections = createAutoLayout()

  // Eternal Love Theme
  if (selectedTheme.id === "love") {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div
          className="fixed inset-0"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 154, 158, 1) 0%, 
              rgba(254, 207, 239, 0.95) 50%, 
              rgba(255, 107, 157, 1) 100%),
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
          }}
        />

        {/* Floating Hearts Animation */}
        {showHearts && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {[...Array(15)].map((_, i) => (
              <Heart
                key={i}
                className={`absolute animate-pulse ${i % 3 === 0 ? "text-red-500" : i % 3 === 1 ? "text-white" : "text-pink-200"}`}
                style={{
                  left: `${10 + ((i * 7) % 80)}%`,
                  top: `${10 + ((i * 13) % 80)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                  transform: `translateY(${scrollY * (0.1 + (i % 3) * 0.05)}px) scale(${0.4 + (i % 4) * 0.2}) rotate(${(scrollY * 0.1 + i * 30) % 360}deg)`,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  opacity: 0.6 + Math.sin(scrollY * 0.01 + i) * 0.4,
                }}
                size={12 + (i % 4) * 8}
              />
            ))}
          </div>
        )}

        {/* Sparkle Effects */}
        <div className="fixed inset-0 pointer-events-none z-5">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-yellow-300 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
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
                  className="w-80 h-80 mx-auto rounded-full overflow-hidden shadow-2xl border-8 border-white/30 backdrop-blur-sm transition-transform duration-700 hover:scale-105"
                  style={{
                    background: "linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))",
                  }}
                >
                  {coverPhoto ? (
                    <Image
                      src={coverPhoto.content || "/placeholder.svg"}
                      alt="Kapak Fotoğrafı"
                      width={320}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <div className="text-center">
                        <Heart className="h-20 w-20 text-pink-400 mx-auto mb-4" />
                        <p className="text-pink-600 font-medium">Ana Fotoğrafınız</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Ring Effect */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400 flex items-center justify-center animate-bounce">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>

                {/* Love Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl animate-pulse" />
              </div>

              {/* Scroll Indicator */}
              <div className="animate-bounce mt-12">
                <ChevronDown className="h-8 w-8 text-white/70 mx-auto" />
                <p className="text-white/70 text-sm mt-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                  Hikayemizi keşfet
                </p>
              </div>
            </div>
          </section>

          {/* Names Section */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="transform transition-all duration-1000">
                <div className="flex items-center justify-center gap-8 mb-8">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl">👨</span>
                    </div>
                    <h2
                      className="text-2xl font-bold text-white mb-2"
                      style={{
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)",
                      }}
                    >
                      {texts
                        .find((t) => t.title.toLowerCase().includes("erkek") || t.title.toLowerCase().includes("adam"))
                        ?.content.split(" ")[0] || "Sevgilim"}
                    </h2>
                  </div>

                  <div className="flex flex-col items-center">
                    <Heart className="h-12 w-12 text-pink-300 animate-pulse mb-2" />
                    <span
                      className="text-white/80 text-lg font-medium"
                      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                    >
                      ∞
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl">👩</span>
                    </div>
                    <h2
                      className="text-2xl font-bold text-white mb-2"
                      style={{
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)",
                      }}
                    >
                      {texts
                        .find((t) => t.title.toLowerCase().includes("kadın") || t.title.toLowerCase().includes("kız"))
                        ?.content.split(" ")[0] || "Sevgilim"}
                    </h2>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <p
                    className="text-white text-lg leading-relaxed"
                    style={{
                      fontFamily: "'Dancing Script', cursive",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    "İki kalp, bir hikaye... Sonsuzluğa uzanan aşkımızın başlangıcı"
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
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.4)",
                      }}
                    >
                      {sectionIndex === 0 ? "Bizim Anılarımız" : "Daha Fazla Anı"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {section.data.map((image) => (
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

                          {/* Floating Hearts on Hover */}
                          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {[...Array(3)].map((_, i) => (
                              <Heart
                                key={i}
                                className="absolute text-pink-300 animate-ping"
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
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Kalbimizdeki Sözler
                    </h4>
                    <div className="space-y-8">
                      {section.data.map((text, index) => (
                        <div key={text.id} className={`max-w-2xl ${index % 2 === 0 ? "ml-auto" : "mr-auto"}`}>
                          <Card className="bg-white/15 backdrop-blur-md border-white/20 border">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5
                                    className="font-semibold text-white mb-2"
                                    style={{
                                      fontFamily: "'Dancing Script', cursive",
                                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                    }}
                                  >
                                    {text.title}
                                  </h5>
                                  <p
                                    className="text-white/90 leading-relaxed italic"
                                    style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9)" }}
                                  >
                                    "{text.content}"
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
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Hareketli Anılarımız
                    </h4>
                    <div className="max-w-2xl mx-auto">
                      <div className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20">
                        <video
                          ref={videoRef}
                          src={section.data.content}
                          poster={section.data.thumbnail}
                          controls
                          className="w-full aspect-video object-cover"
                        />
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
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Aşkımızın Melodisi
                    </h4>
                    <div className="max-w-md mx-auto">
                      <Card className="bg-white/15 backdrop-blur-md border-white/20 border">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={togglePlay}
                              className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:from-pink-500 hover:to-purple-500"
                            >
                              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                            </Button>
                            <div className="flex-1 text-left">
                              <p
                                className="font-medium text-white"
                                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                              >
                                {section.data.title}
                              </p>
                              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                                <div className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full w-1/3 transition-all duration-300"></div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleMute}
                              className="text-white hover:bg-white/10"
                            >
                              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                          </div>
                          <audio
                            ref={audioRef}
                            src={section.data.content}
                            className="hidden"
                            loop={false}
                            muted={isMuted}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {/* YouTube Section */}
                {section.type === "youtube" && (
                  <>
                    <h4
                      className="text-3xl font-bold text-center text-white mb-12"
                      style={{
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Bizim Şarkımız
                    </h4>
                    <div className="max-w-2xl mx-auto">
                      <Card className="bg-white/15 backdrop-blur-md border-white/20 border overflow-hidden">
                        <div className="aspect-video bg-black/20 relative group">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Music className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                              <p
                                className="text-white font-medium"
                                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                              >
                                {section.data.title}
                              </p>
                              <p
                                className="text-white/80 text-sm mt-2"
                                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                              >
                                NFC etiketini okuttuğunuzda YouTube müzik çalacak
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Music className="h-5 w-5 text-pink-400" />
                            <p className="text-white font-medium" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}>
                              {section.data.title}
                            </p>
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
                  <Heart className="h-8 w-8 text-pink-300 animate-pulse" />
                  <span className="text-3xl" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                    ∞
                  </span>
                  <Heart className="h-8 w-8 text-pink-300 animate-pulse" />
                </div>
                <h3
                  className="text-2xl font-bold text-white mb-4"
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  Sonsuza Kadar Birlikte
                </h3>
                <p className="text-white/80 mb-6" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                  Bu hikaye sadece bir başlangıç... Daha nice güzel anılar biriktireceğiz.
                </p>
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 px-6 py-2">
                  💕 NFC Aşk Bilekliği ile Paylaşıldı
                </Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // Wild Adventure Theme
  if (selectedTheme.id === "adventure") {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Dynamic Background */}
        <div
          className="fixed inset-0"
          style={{
            background: `linear-gradient(135deg, 
              rgba(102, 126, 234, 0.9) 0%, 
              rgba(118, 75, 162, 0.8) 100%),
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Stars Animation */}
        {showStars && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {[...Array(15)].map((_, i) => (
              <Star
                key={i}
                className={`absolute animate-pulse ${i % 3 === 0 ? "text-yellow-300" : i % 3 === 1 ? "text-white" : "text-blue-200"}`}
                style={{
                  left: `${10 + ((i * 7) % 80)}%`,
                  top: `${10 + ((i * 13) % 80)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                  transform: `translateY(${scrollY * (0.1 + (i % 3) * 0.05)}px) scale(${0.4 + (i % 4) * 0.2}) rotate(${(scrollY * 0.1 + i * 30) % 360}deg)`,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  opacity: 0.6 + Math.sin(scrollY * 0.01 + i) * 0.4,
                }}
                size={12 + (i % 4) * 8}
              />
            ))}
          </div>
        )}

        <div className="relative z-20">
          {/* Hero Section - Cover Photo */}
          <section className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              {/* Cover Photo */}
              {coverPhoto ? (
                <div className="rounded-3xl overflow-hidden shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                  <div className="relative aspect-video">
                    <Image
                      src={coverPhoto.content || "/placeholder.svg"}
                      alt={coverPhoto.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h1
                        className="text-5xl font-bold text-white mb-4"
                        style={{
                          fontFamily: "'Roboto Condensed', sans-serif",
                          textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                        }}
                      >
                        🏔️ MACERA GÜNLÜĞÜM
                      </h1>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-96 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8">
                  <div className="text-center text-white">
                    <Mountain className="h-20 w-20 mx-auto mb-4" />
                    <h1
                      className="text-5xl font-bold mb-4"
                      style={{
                        fontFamily: "'Roboto Condensed', sans-serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      🏔️ MACERA GÜNLÜĞÜM
                    </h1>
                  </div>
                </div>
              )}

              <p className="text-xl text-white/90 mb-8" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                Sınırları aşan, ruhu özgürleştiren hikayem
              </p>

              <div className="animate-bounce">
                <ChevronDown className="h-8 w-8 text-white/70 mx-auto" />
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
                        fontFamily: "'Roboto Condensed', sans-serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      {sectionIndex === 0 ? "📸 Macera Kareleri" : "📸 Daha Fazla Macera"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {section.data.map((image) => (
                        <div
                          key={image.id}
                          className="group relative aspect-[4/3] rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                        >
                          <Image
                            src={image.content || "/placeholder.svg"}
                            alt={image.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <h4
                              className="font-bold text-lg mb-1"
                              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9)" }}
                            >
                              {image.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span className="text-sm" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9)" }}>
                                Unutulmaz An
                              </span>
                            </div>
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
                        fontFamily: "'Roboto Condensed', sans-serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      📝 Macera Hikayeleri
                    </h4>
                    <div className="space-y-8">
                      {section.data.map((text) => (
                        <Card
                          key={text.id}
                          className="bg-white/15 backdrop-blur-md border-white/20 border transform hover:scale-105 transition-all duration-300"
                        >
                          <CardContent className="p-8">
                            <div className="flex items-start gap-6">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🏕️</span>
                              </div>
                              <div className="flex-1">
                                <h4
                                  className="text-2xl font-bold text-white mb-4"
                                  style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9)" }}
                                >
                                  {text.title}
                                </h4>
                                <p
                                  className="text-white/90 text-lg leading-relaxed"
                                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9)" }}
                                >
                                  {text.content}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                        fontFamily: "'Roboto Condensed', sans-serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      🎬 Macera Videoları
                    </h4>
                    <div className="max-w-3xl mx-auto">
                      <div className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20">
                        <video
                          ref={videoRef}
                          src={section.data.content}
                          poster={section.data.thumbnail}
                          controls
                          className="w-full aspect-video object-cover"
                        />
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
                        fontFamily: "'Roboto Condensed', sans-serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      🎵 Doğa Sesleri
                    </h4>
                    <div className="max-w-md mx-auto">
                      <Card className="bg-white/15 backdrop-blur-md border-white/20 border">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={togglePlay}
                              className="border-blue-300 text-blue-100 hover:bg-blue-800/20"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <div className="flex-1">
                              <p
                                className="font-medium text-white"
                                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                              >
                                {section.data.title}
                              </p>
                              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                                <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full w-1/3 transition-all duration-300"></div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={toggleMute}
                              className="border-blue-300 text-blue-100 hover:bg-blue-800/20"
                            >
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                          </div>
                          <audio
                            ref={audioRef}
                            src={section.data.content}
                            className="hidden"
                            loop={false}
                            muted={isMuted}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {/* YouTube Section */}
                {section.type === "youtube" && (
                  <>
                    <h4
                      className="text-3xl font-bold text-center text-white mb-12"
                      style={{
                        fontFamily: "'Roboto Condensed', sans-serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      🎵 Macera Müziğim
                    </h4>
                    <div className="max-w-2xl mx-auto">
                      <Card className="bg-white/15 backdrop-blur-md border-white/20 border overflow-hidden">
                        <div className="aspect-video bg-black/20 relative group">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Music className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                              <p
                                className="text-white font-medium"
                                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                              >
                                {section.data.title}
                              </p>
                              <p
                                className="text-white/80 text-sm mt-2"
                                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                              >
                                NFC etiketini okuttuğunuzda YouTube müzik çalacak
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Music className="h-5 w-5 text-blue-400" />
                            <p className="text-white font-medium" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}>
                              {section.data.title}
                            </p>
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
                <h3
                  className="text-3xl font-bold text-white mb-4"
                  style={{
                    fontFamily: "'Roboto Condensed', sans-serif",
                    textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  🌟 Macera Devam Ediyor
                </h3>
                <p className="text-white/80 mb-6" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                  Her yeni gün, yeni bir macera... Hikayem daha yeni başlıyor.
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-6 py-2">
                  🏔️ NFC Macera Bilekliği ile Paylaşıldı
                </Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // Golden Memories Theme
  if (selectedTheme.id === "memories") {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Elegant Background */}
        <div
          className="fixed inset-0"
          style={{
            background: `linear-gradient(135deg, 
              rgba(240, 147, 251, 0.9) 0%, 
              rgba(245, 87, 108, 0.8) 100%),
              radial-gradient(circle at 30% 70%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)`,
          }}
        />

        {/* Floating Sparkles Animation */}
        {showSparkles && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {[...Array(15)].map((_, i) => (
              <Sparkles
                key={i}
                className={`absolute animate-pulse ${i % 3 === 0 ? "text-yellow-300" : i % 3 === 1 ? "text-white" : "text-orange-200"}`}
                style={{
                  left: `${10 + ((i * 7) % 80)}%`,
                  top: `${10 + ((i * 13) % 80)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                  transform: `translateY(${scrollY * (0.1 + (i % 3) * 0.05)}px) scale(${0.4 + (i % 4) * 0.2}) rotate(${(scrollY * 0.1 + i * 30) % 360}deg)`,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  opacity: 0.6 + Math.sin(scrollY * 0.01 + i) * 0.4,
                }}
                size={12 + (i % 4) * 8}
              />
            ))}
          </div>
        )}

        <div className="relative z-20">
          {/* Elegant Header */}
          <section className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-12">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mb-8 shadow-2xl">
                  {coverPhoto ? (
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src={coverPhoto.content || "/placeholder.svg"}
                        alt={coverPhoto.title}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Sparkles className="h-16 w-16 text-white" />
                  )}
                </div>
                <h1
                  className="text-6xl font-bold text-white mb-6"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  Golden Memories
                </h1>
                <p className="text-2xl text-white/90 mb-8" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                  Altın değerindeki anılarımızın koleksiyonu
                </p>
              </div>

              <div className="animate-bounce">
                <ChevronDown className="h-8 w-8 text-white/70 mx-auto" />
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
                        fontFamily: "'Playfair Display', serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      {sectionIndex === 0 ? "Değerli Anılar" : "Daha Fazla Anı"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {section.data.map((image) => (
                        <Card
                          key={image.id}
                          className="bg-white/20 backdrop-blur-md border-white/30 border overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                        >
                          <div className="aspect-square relative">
                            <Image
                              src={image.content || "/placeholder.svg"}
                              alt={image.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                                <Star className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-6">
                            <h3
                              className="text-xl font-bold text-white mb-2"
                              style={{
                                fontFamily: "'Playfair Display', serif",
                                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                              }}
                            >
                              {image.title}
                            </h3>
                          </CardContent>
                        </Card>
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
                        fontFamily: "'Playfair Display', serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Altın Değerinde Sözler
                    </h4>
                    <div className="space-y-8">
                      {section.data.map((text) => (
                        <Card
                          key={text.id}
                          className="bg-white/15 backdrop-blur-md border-white/20 border transform hover:scale-105 transition-all duration-300"
                        >
                          <CardContent className="p-8">
                            <div className="flex items-start gap-6">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <Crown className="h-8 w-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4
                                  className="text-2xl font-bold text-white mb-4"
                                  style={{
                                    fontFamily: "'Playfair Display', serif",
                                    textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
                                  }}
                                >
                                  {text.title}
                                </h4>
                                <p
                                  className="text-white/90 text-lg leading-relaxed"
                                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9)" }}
                                >
                                  {text.content}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                        fontFamily: "'Playfair Display', serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Hareketli Anılar
                    </h4>
                    <div className="max-w-3xl mx-auto">
                      <div className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20">
                        <video
                          ref={videoRef}
                          src={section.data.content}
                          poster={section.data.thumbnail}
                          controls
                          className="w-full aspect-video object-cover"
                        />
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
                        fontFamily: "'Playfair Display', serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Özel Melodiler
                    </h4>
                    <div className="max-w-md mx-auto">
                      <Card className="bg-white/15 backdrop-blur-md border-white/20 border">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={togglePlay}
                              className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
                            >
                              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                            </Button>
                            <div className="flex-1">
                              <p
                                className="font-medium text-white"
                                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                              >
                                {section.data.title}
                              </p>
                              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full w-1/3 transition-all duration-300"></div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleMute}
                              className="text-white hover:bg-white/10"
                            >
                              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                          </div>
                          <audio
                            ref={audioRef}
                            src={section.data.content}
                            className="hidden"
                            loop={false}
                            muted={isMuted}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {/* YouTube Section */}
                {section.type === "youtube" && (
                  <>
                    <h4
                      className="text-3xl font-bold text-center text-white mb-12"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      Özel Şarkımız
                    </h4>
                    <div className="max-w-2xl mx-auto">
                      <Card className="bg-white/15 backdrop-blur-md border-white/20 border overflow-hidden">
                        <div className="aspect-video bg-black/20 relative group">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Music className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                              <p
                                className="text-white font-medium"
                                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                              >
                                {section.data.title}
                              </p>
                              <p
                                className="text-white/80 text-sm mt-2"
                                style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                              >
                                NFC etiketini okuttuğunuzda YouTube müzik çalacak
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Music className="h-5 w-5 text-yellow-400" />
                            <p className="text-white font-medium" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}>
                              {section.data.title}
                            </p>
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
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <Sparkles className="h-8 w-8 text-orange-400" />
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
                <h3
                  className="text-3xl font-bold text-white mb-4"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    textShadow: "3px 3px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  Altın Değerinde Anılar
                </h3>
                <p className="text-white/80 mb-6" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                  Her anı bir hazine... Bu koleksiyon büyümeye devam edecek.
                </p>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-6 py-2">
                  ✨ NFC Anı Bilekliği ile Paylaşıldı
                </Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <Card className="p-8 text-center max-w-md mx-4">
        <h1 className="text-2xl font-bold mb-4">Tema Bulunamadı</h1>
        <p className="text-gray-600">Seçilen tema desteklenmiyor.</p>
      </Card>
    </div>
  )
}
