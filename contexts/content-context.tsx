"use client"

import React, { createContext, useContext, useReducer, type ReactNode } from "react"

export interface MediaContent {
  id: string
  type: "image" | "video" | "audio" | "text"
  title: string
  content: string // URL for media, text content for text type
  thumbnailUrl?: string
  duration?: number // for video/audio
  createdAt: string
}

export interface Theme {
  id: string
  name: string
  description: string
  preview: string
  layout: {
    backgroundColor: string
    textColor: string
    accentColor: string
    fontFamily: string
    sections: Array<{
      type: "header" | "gallery" | "text" | "audio" | "video"
      position: { x: number; y: number; width: number; height: number }
      style?: Record<string, any>
    }>
  }
  isPremium: boolean
}

export interface OrderContent {
  orderId: string
  mediaItems: MediaContent[]
  selectedTheme?: Theme
  isPublished: boolean
  nfcUrl?: string
  nfcContentId?: string
}

interface ContentState {
  orderContents: Record<string, OrderContent>
  availableThemes: Theme[]
  isLoading: boolean
}

type ContentAction =
  | { type: "SET_ORDER_CONTENT"; payload: { orderId: string; content: OrderContent } }
  | { type: "ADD_MEDIA_ITEM"; payload: { orderId: string; item: MediaContent } }
  | { type: "REMOVE_MEDIA_ITEM"; payload: { orderId: string; itemId: string } }
  | { type: "UPDATE_MEDIA_ITEM"; payload: { orderId: string; itemId: string; updates: Partial<MediaContent> } }
  | { type: "SELECT_THEME"; payload: { orderId: string; theme: Theme } }
  | { type: "PUBLISH_CONTENT"; payload: { orderId: string } }
  | { type: "SET_NFC_CONTENT_ID"; payload: { orderId: string; nfcContentId: string } }
  | { type: "SET_LOADING"; payload: boolean }

const ContentContext = createContext<{
  state: ContentState
  dispatch: React.Dispatch<ContentAction>
  getOrderContent: (orderId: string) => OrderContent | undefined
    uploadMedia: (
    orderId: string,
    data: File | string,
    type: MediaContent["type"],
    title: string,
    duration?: number,
  ) => Promise<MediaContent>
  fetchMediaItems: (orderId: string) => Promise<void>
} | null>(null)

// mockThemes array'ini güncelle:
const mockThemes: Theme[] = [
  {
    id: "love",
    name: "Eternal Love",
    description: "Sonsuz aşkınız için büyülü bir hikaye",
    preview: "/placeholder.svg?height=200&width=300&text=Eternal+Love",
    layout: {
      backgroundColor: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
      textColor: "#2d1b69",
      accentColor: "#ff6b9d",
      fontFamily: "'Dancing Script', cursive",
      sections: [
        { type: "header", position: { x: 0, y: 0, width: 100, height: 100 } },
        { type: "gallery", position: { x: 0, y: 100, width: 100, height: 60 } },
        { type: "text", position: { x: 0, y: 160, width: 100, height: 40 } },
        { type: "audio", position: { x: 0, y: 200, width: 100, height: 30 } },
      ],
    },
    isPremium: false,
  },
  {
    id: "adventure",
    name: "Wild Adventure",
    description: "Maceralarınızın epik hikayesi",
    preview: "/placeholder.svg?height=200&width=300&text=Wild+Adventure",
    layout: {
      backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      textColor: "#ffffff",
      accentColor: "#ffd700",
      fontFamily: "'Roboto Condensed', sans-serif",
      sections: [
        { type: "video", position: { x: 0, y: 0, width: 100, height: 50 } },
        { type: "header", position: { x: 0, y: 50, width: 100, height: 20 } },
        { type: "gallery", position: { x: 0, y: 70, width: 100, height: 50 } },
        { type: "text", position: { x: 0, y: 120, width: 100, height: 30 } },
      ],
    },
    isPremium: false,
  },
  {
    id: "memories",
    name: "Golden Memories",
    description: "Altın değerindeki anılarınız",
    preview: "/placeholder.svg?height=200&width=300&text=Golden+Memories",
    layout: {
      backgroundColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      textColor: "#2c3e50",
      accentColor: "#f39c12",
      fontFamily: "'Playfair Display', serif",
      sections: [
        { type: "header", position: { x: 0, y: 0, width: 100, height: 25 } },
        { type: "gallery", position: { x: 0, y: 25, width: 100, height: 75 } },
        { type: "text", position: { x: 0, y: 100, width: 100, height: 50 } },
      ],
    },
    isPremium: true,
  },
]

function contentReducer(state: ContentState, action: ContentAction): ContentState {
  switch (action.type) {
    case "SET_ORDER_CONTENT":
      return {
        ...state,
        orderContents: {
          ...state.orderContents,
          [action.payload.orderId]: action.payload.content,
        },
      }

    case "ADD_MEDIA_ITEM":
      const currentContent = state.orderContents[action.payload.orderId] || {
        orderId: action.payload.orderId,
        mediaItems: [],
        isPublished: false,
      }
      return {
        ...state,
        orderContents: {
          ...state.orderContents,
          [action.payload.orderId]: {
            ...currentContent,
            mediaItems: [...currentContent.mediaItems, action.payload.item],
          },
        },
      }

    case "REMOVE_MEDIA_ITEM":
      const contentToUpdate = state.orderContents[action.payload.orderId]
      if (!contentToUpdate) return state
      return {
        ...state,
        orderContents: {
          ...state.orderContents,
          [action.payload.orderId]: {
            ...contentToUpdate,
            mediaItems: contentToUpdate.mediaItems.filter((item) => item.id !== action.payload.itemId),
          },
        },
      }

    case "UPDATE_MEDIA_ITEM":
      const contentForUpdate = state.orderContents[action.payload.orderId]
      if (!contentForUpdate) return state
      return {
        ...state,
        orderContents: {
          ...state.orderContents,
          [action.payload.orderId]: {
            ...contentForUpdate,
            mediaItems: contentForUpdate.mediaItems.map((item) =>
              item.id === action.payload.itemId ? { ...item, ...action.payload.updates } : item,
            ),
          },
        },
      }

    case "SELECT_THEME":
      const contentForTheme = state.orderContents[action.payload.orderId] || {
        orderId: action.payload.orderId,
        mediaItems: [],
        isPublished: false,
      }
      return {
        ...state,
        orderContents: {
          ...state.orderContents,
          [action.payload.orderId]: {
            ...contentForTheme,
            selectedTheme: action.payload.theme,
          },
        },
      }


    case "PUBLISH_CONTENT":
      const contentToPublish = state.orderContents[action.payload.orderId]
      if (!contentToPublish) return state
      return {
        ...state,
        orderContents: {
          ...state.orderContents,
          [action.payload.orderId]: {
            ...contentToPublish,
            isPublished: true,
            nfcUrl: `https://nfc-bracelet-ecommerce-mvls.vercel.app/${action.payload.orderId}`,
          },
        },
      }
      case "SET_NFC_CONTENT_ID":
      const baseContent = state.orderContents[action.payload.orderId] || {
        orderId: action.payload.orderId,
        mediaItems: [],
        isPublished: false,
      }
      return {
        ...state,
        orderContents: {
          ...state.orderContents,
          [action.payload.orderId]: {
            ...baseContent,
            nfcContentId: action.payload.nfcContentId,
          },
        },
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

// contentReducer fonksiyonundan sonra, ContentProvider fonksiyonunun başında demo içerik ekleyelim:

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contentReducer, {
    orderContents: {
      // Demo sipariş ekleyelim
      "demo-love-order": {
        orderId: "demo-love-order",
        nfcContentId: "demo-love-content",
        mediaItems: [
          {
            id: "1",
            type: "image",
            title: "Bizim İlk Fotoğrafımız",
            content: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=800&fit=crop&crop=faces",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            type: "image",
            title: "Sahilde Yürüyüş",
            content: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&h=600&fit=crop",
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            type: "image",
            title: "Piknik Günümüz",
            content: "https://images.unsplash.com/photo-1521543907208-2ba7d2b9b1b5?w=800&h=600&fit=crop",
            createdAt: new Date().toISOString(),
          },
          {
            id: "4",
            type: "image",
            title: "Gün Batımında",
            content: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=600&fit=crop",
            createdAt: new Date().toISOString(),
          },
          {
            id: "5",
            type: "image",
            title: "Kahve Molası",
            content: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=600&fit=crop",
            createdAt: new Date().toISOString(),
          },
          {
            id: "6",
            type: "image",
            title: "Doğa Yürüyüşü",
            content: "https://images.unsplash.com/photo-1537204696486-967f1b7198c8?w=800&h=600&fit=crop",
            createdAt: new Date().toISOString(),
          },
          {
            id: "7",
            type: "text",
            title: "Sana Olan Aşkım",
            content:
              "Sen benim hayatımın en güzel hediyesisin. Her sabah gözlerini açtığında dünyam aydınlanıyor. Seninle geçirdiğim her an, kalbimde sonsuza kadar yaşayacak bir anı oluyor. Seni seviyorum, bugün, yarın ve her zaman...",
            createdAt: new Date().toISOString(),
          },
          {
            id: "8",
            type: "text",
            title: "İlk Buluşmamız",
            content:
              "O gün seni ilk gördüğümde zamanın durduğunu hissettim. Gülüşün, bakışların, her şeyin o kadar mükemmeldi ki... O andan itibaren hayatım değişti. Sen benim ruhuma dokunan tek kişisin.",
            createdAt: new Date().toISOString(),
          },
          {
            id: "9",
            type: "text",
            title: "Gelecek Hayallerimiz",
            content:
              "Seninle kuracağımız yuva, birlikte göreceğimiz yerler, yaşayacağımız anılar... Hepsi hayal değil artık, gerçek olacak. Çünkü sen varsın ve birlikte her şeyi başarabiliriz.",
            createdAt: new Date().toISOString(),
          },
          {
            id: "10",
            type: "audio",
            title: "Bizim Şarkımız - Perfect",
            content: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            duration: 180,
            createdAt: new Date().toISOString(),
          },
          {
            id: "11",
            type: "video",
            title: "Birlikte Geçirdiğimiz Anlar",
            content: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=300&fit=crop",
            duration: 60,
            createdAt: new Date().toISOString(),
          },
        ],
        selectedTheme: mockThemes[0], // Eternal Love teması
        isPublished: true,
        nfcUrl: "https://nfc.example.com/demo-love-order",
      },
    },
    availableThemes: mockThemes,
    isLoading: false,
  })

  const fetchedOrdersRef = React.useRef<Set<string>>(new Set())
  
  const getOrderContent = (orderId: string): OrderContent | undefined => {
    const content = state.orderContents[orderId]
    if (
      content &&
      content.nfcContentId &&
      content.mediaItems.length === 0 &&
      !fetchedOrdersRef.current.has(orderId)
    ) {
      fetchedOrdersRef.current.add(orderId)
      fetchMediaItems(orderId)
    }
    return content
  }
  const fetchMediaItems = async (orderId: string): Promise<void> => {
    const content = state.orderContents[orderId]
    if (!content?.nfcContentId) return

    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch(`/api/media-items?nfcContentId=${content.nfcContentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success && Array.isArray(data.items)) {
        const items: MediaContent[] = data.items.map((item: any) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          content: item.content,
          thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || undefined,
          duration: item.duration || undefined,
          createdAt: item.createdAt || item.created_at,
        }))

        dispatch({
          type: "SET_ORDER_CONTENT",
          payload: { orderId, content: { ...content, mediaItems: items } },
        })
      }
    } catch (error) {
      console.error("Fetch media items error:", error)
    }
  }
  const ensureNFCContent = async (orderId: string): Promise<string> => {
    const existing = state.orderContents[orderId]
    if (existing?.nfcContentId) {
      return existing.nfcContentId
    }

    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Not authenticated")
    }

    const response = await fetch("/api/nfc-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    })

    const data = await response.json()
    if (!data.success || !data.nfcContent) {
      throw new Error("Failed to create NFC content")
    }

    dispatch({
      type: "SET_NFC_CONTENT_ID",
      payload: { orderId, nfcContentId: data.nfcContent.id },
    })

    return data.nfcContent.id
  }
  const uploadMedia = async (
    orderId: string,
    data: File | string,
    type: MediaContent["type"],
    title: string,
   duration?: number,
  ): Promise<MediaContent> => {
    const nfcContentId = await ensureNFCContent(orderId)

    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Not authenticated")
    }

      let response: Response

    if (data instanceof File) {
      const formData = new FormData()
      formData.append("file", data)
      formData.append("nfc_content_id", nfcContentId)
      formData.append("type", type)
      formData.append("title", title)
      if (duration) formData.append("duration", duration.toString())
      response = await fetch("/api/media-items", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
    } else {
      const payload: any = {
        nfc_content_id: nfcContentId,
        type,
        title,
        content: data,
      }
      if (duration) payload.duration = duration
      if (type === "audio") {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/
        const match = data.match(regExp)
        const youtubeId = match && match[2].length === 11 ? match[2] : null
        if (youtubeId) {
          payload.thumbnail_url = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        }
      }
      response = await fetch("/api/media-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }) 
    }

     const result = await response.json()
    if (!result.success || !result.mediaItem) {
      throw new Error("Upload failed")
    }
    const mediaItem: MediaContent = {
      id: result.mediaItem.id,
      type: result.mediaItem.type,
      title: result.mediaItem.title,
      content: result.mediaItem.content,
      thumbnailUrl: result.mediaItem.thumbnailUrl || result.mediaItem.thumbnail_url || undefined,
      duration: result.mediaItem.duration || undefined,
      createdAt: result.mediaItem.createdAt || result.mediaItem.created_at,
    }
    dispatch({ type: "ADD_MEDIA_ITEM", payload: { orderId, item: mediaItem } })
    return mediaItem
  }
  return (
    <ContentContext.Provider
      value={{
          state,
          dispatch,
          getOrderContent,
          uploadMedia,
          fetchMediaItems,
        }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider")
  }
  return context
}
