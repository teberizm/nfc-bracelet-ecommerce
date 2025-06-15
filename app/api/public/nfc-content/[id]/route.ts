export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import {
  getNFCContentByOrderIdPublic,
  getNFCContentByIdPublic,
  getMediaItemsByContentId,
} from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 })
    }

    let content = await getNFCContentByOrderIdPublic(id)
    if (!content) {
      content = await getNFCContentByIdPublic(id)
    }
    if (!content) {
      return NextResponse.json({ success: false, message: "Content not found" }, { status: 404 })
    }

    const rawItems = await getMediaItemsByContentId(content.id)
    const mediaItems = rawItems.map((item) => ({
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
    let customizations = content.customizations
    if (typeof customizations === "string") {
      try {
        customizations = JSON.parse(customizations)
      } catch (_) {
        customizations = null
      }
    }
    return NextResponse.json({
      success: true,
      orderContent: {
        orderId: content.order_id,
        nfcContentId: content.id,
        theme: content.theme ? { slug: content.theme, name: content.theme_name } : null,
         customizations,
        mediaItems,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/public/nfc-content/[id]:", error)
     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}