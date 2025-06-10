"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Video360PlayerProps {
  videoSrc: string
  className?: string
  autoPlay?: boolean
}

export function Video360Player({ videoSrc, className, autoPlay = true }: Video360PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isDragging, setIsDragging] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)

  // Video yüklendiğinde
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (autoPlay) {
        video.play()
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [autoPlay])

  // Mouse/Touch drag başlangıcı
  const handleDragStart = useCallback(
    (clientX: number) => {
      setIsDragging(true)
      setDragStartX(clientX)
      setDragStartTime(currentTime)

      // Video'yu duraklat
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    },
    [currentTime],
  )

  // Mouse/Touch drag hareketi
  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !videoRef.current || !containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.offsetWidth
      const deltaX = clientX - dragStartX
      const deltaPercent = deltaX / containerWidth

      // Video süresini hesapla (360° = tam video süresi)
      const newTime = dragStartTime + deltaPercent * duration
      const clampedTime = Math.max(0, Math.min(duration, newTime))

      videoRef.current.currentTime = clampedTime
      setCurrentTime(clampedTime)
    },
    [isDragging, dragStartX, dragStartTime, duration],
  )

  // Mouse/Touch drag bitişi
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)

    // Eğer otomatik oynatma açıksa video'yu devam ettir
    if (autoPlay && videoRef.current) {
      videoRef.current.play()
    }
  }, [autoPlay])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleDragStart(touch.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleDragMove(touch.clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleDragEnd()
  }

  // Global mouse events
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX)
    }

    const handleGlobalMouseUp = () => {
      handleDragEnd()
    }

    document.addEventListener("mousemove", handleGlobalMouseMove)
    document.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Reset video
  const resetVideo = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    setCurrentTime(0)
  }

  // Progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !e.currentTarget) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickPercent = clickX / rect.width
    const newTime = clickPercent * duration

    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={cn("relative group", className)}>
      {/* Video Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-lg bg-black cursor-grab select-none",
          isDragging && "cursor-grabbing",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
        />

        {/* Overlay Instructions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-sm font-medium mb-1">360° Görünüm</div>
            <div className="text-xs opacity-80">Sürükleyerek çevirin</div>
          </div>
        </div>

        {/* Loading Indicator */}
        {duration === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full mb-3 cursor-pointer" onClick={handleProgressClick}>
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8 p-0" onClick={resetVideo}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-white text-xs">{Math.round(progressPercent)}% / 360°</div>
        </div>
      </div>

      {/* Mobile Touch Hint */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:hidden">
        👆 Dokunup sürükleyin
      </div>
    </div>
  )
}
