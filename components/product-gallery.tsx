"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Video360Player } from "./360-video-player"

interface ProductGalleryProps {
  images: string[]
  productName: string
  video360?: string // 360° video URL'i
}

export function ProductGallery({ images, productName, video360 }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  console.log("🖼️ ProductGallery render:", {
    imagesCount: images.length,
    images: images,
    video360: video360 ? "Var" : "Yok",
    showVideo,
  })

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  // Eğer resim yoksa placeholder göster
  const displayImages = images.length > 0 ? images : ["/placeholder.svg?height=600&width=600&text=No+Image"]

  return (
    <div className="space-y-4">
      {/* Ana Görsel/Video */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {showVideo && video360 ? (
          <div className="relative w-full h-full">
            <Video360Player videoSrc={video360} className="w-full h-full" autoPlay={true} />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              onClick={() => setShowVideo(false)}
            >
              <Pause className="h-4 w-4 mr-1" />
              Fotoğraflar
            </Button>
          </div>
        ) : (
          <>
            <Image
              src={displayImages[currentImage] || "/placeholder.svg?height=600&width=600"}
              alt={`${productName} - Görsel ${currentImage + 1}`}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                console.error("Resim yüklenemedi:", displayImages[currentImage])
                // Hata durumunda placeholder göster
                e.currentTarget.src = "/placeholder.svg?height=600&width=600&text=Image+Error"
              }}
            />

            {/* Navigation Arrows - Sadece birden fazla resim varsa göster */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Görsel Sayacı - Sadece birden fazla resim varsa göster */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImage + 1} / {displayImages.length}
              </div>
            )}

            {/* 360° Video Toggle Button */}
            {video360 && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                onClick={() => setShowVideo(true)}
              >
                <Play className="h-4 w-4 mr-1" />
                360° Görünüm
              </Button>
            )}
          </>
        )}
      </div>

      {/* Küçük Görseller - Sadece birden fazla resim varsa göster */}
      {!showVideo && displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                currentImage === index
                  ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <Image
                src={image || "/placeholder.svg?height=150&width=150"}
                alt={`${productName} - Küçük görsel ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  console.error("Küçük resim yüklenemedi:", image)
                  e.currentTarget.src = "/placeholder.svg?height=150&width=150&text=Error"
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* 360° Video Thumbnail - Video varsa ve şu anda video gösterilmiyorsa */}
      {video360 && !showVideo && (
        <div className="mt-2">
          <button
            onClick={() => setShowVideo(true)}
            className="relative w-full aspect-video overflow-hidden rounded-md border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <Play className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium text-blue-600">360° Görünüm</div>
                <div className="text-xs text-blue-500">Interaktif video</div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Debug Bilgileri - Sadece development'ta göster */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <div>
            <strong>Debug:</strong>
          </div>
          <div>Resim Sayısı: {images.length}</div>
          <div>Mevcut Resim: {currentImage + 1}</div>
          <div>360° Video: {video360 ? "Var" : "Yok"}</div>
          <div>Video Gösteriliyor: {showVideo ? "Evet" : "Hayır"}</div>
        </div>
      )}
    </div>
  )
}
