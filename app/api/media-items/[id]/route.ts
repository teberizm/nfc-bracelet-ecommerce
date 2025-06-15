import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { deleteMediaItem } from "@/lib/database"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    await deleteMediaItem(params.id)

    return NextResponse.json({ success: true, message: "Media item deleted" })
  } catch (error) {
    console.error("Error in DELETE /api/media-items/[id]:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}