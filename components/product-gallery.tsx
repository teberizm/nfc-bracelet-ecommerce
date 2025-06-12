"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
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

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="space-y-4">
      {/* Ana Görsel/Video */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {showVideo && video360 ? (
          <Video360Player videoSrc={video360} className="w-full h-full" autoPlay={true} />
        ) : (
          <>
            <Image
              src={images[currentImage] || "/placeholder.svg"}
              alt={`${productName} - Görsel ${currentImage + 1}`}
              fill
              className="object-cover"
              priority
            />

            {images.length > 1 && (
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

            {/* Görsel Sayacı */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImage + 1} / {images.length}
              </div>
            )}
          </>
        )}

        {/* 360° Video Toggle Button */}
        {video360 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            onClick={() => setShowVideo(!showVideo)}
          >
            <Play className="h-4 w-4 mr-1" />
            {showVideo ? "Fotoğraflar" : "360° Görünüm"}
          </Button>
        )}
      </div>

      {/* Küçük Görseller */}
      {!showVideo && images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
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
                src={image || "/placeholder.svg"}
                alt={`${productName} - Küçük görsel ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 360° Video Thumbnail */}
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
    </div>
  )
}
