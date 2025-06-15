import { NextResponse, type NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { createMediaItem, getMediaItemsByContentId } from "@/lib/database"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const nfcContentId = searchParams.get("nfcContentId") || searchParams.get("contentId")
    if (!nfcContentId) {
      return NextResponse.json({ success: false, message: "Missing content id" }, { status: 400 })
    }

     const rawItems = await getMediaItemsByContentId(nfcContentId)
    const items = rawItems.map((item) => ({
      id: item.id,
      nfc_content_id: item.nfc_content_id,
      type: item.type,
      title: item.title,
      content: item.content,
      thumbnailUrl: item.thumbnail_url,
      file_size: item.file_size,
      duration: item.duration,
      mime_type: item.mime_type,
      sort_order: item.sort_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error("Error in GET /api/media-items:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const nfcContentId = formData.get("nfc_content_id") as string | null
    const type = formData.get("type") as string | null
    const title = formData.get("title") as string | null
    const sortOrder = formData.get("sort_order") as string | null
    const duration = formData.get("duration") as string | null
    const thumbnailUrl = formData.get("thumbnail_url") as string | null
    const file = formData.get("file") as File | null

    if (!nfcContentId || !type || !title || !file) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || ""
    const fileName = `media/${uuidv4()}.${ext}`
    const blob = await put(fileName, file, { access: "public", addRandomSuffix: false })

    const mediaItem = await createMediaItem({
      nfc_content_id: nfcContentId,
      type,
      title,
      content: blob.url,
      thumbnail_url: thumbnailUrl,
      file_size: file.size,
      duration: duration ? Number(duration) : null,
      mime_type: file.type,
      sort_order: sortOrder ? Number(sortOrder) : 0,
    })

    const normalized = {
      id: mediaItem.id,
      nfc_content_id: mediaItem.nfc_content_id,
      type: mediaItem.type,
      title: mediaItem.title,
      content: mediaItem.content,
      thumbnailUrl: mediaItem.thumbnail_url,
      file_size: mediaItem.file_size,
      duration: mediaItem.duration,
      mime_type: mediaItem.mime_type,
      sort_order: mediaItem.sort_order,
      createdAt: mediaItem.created_at,
      updatedAt: mediaItem.updated_at,
    }
     return NextResponse.json({ success: true, mediaItem: normalized })
  } catch (error) {
    console.error("Error in POST /api/media-items:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}