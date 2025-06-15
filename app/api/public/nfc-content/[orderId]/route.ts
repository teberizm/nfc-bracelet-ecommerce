import { NextResponse } from "next/server"
import { getNFCContentByOrderIdPublic, getMediaItemsByContentId } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Missing order id" }, { status: 400 })
    }

    const content = await getNFCContentByOrderIdPublic(orderId)
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

    return NextResponse.json({
      success: true,
      orderContent: {
        orderId: content.order_id,
        nfcContentId: content.id,
        theme: content.theme ? { slug: content.theme, name: content.theme_name } : null,
        mediaItems,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/public/nfc-content/[orderId]:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}