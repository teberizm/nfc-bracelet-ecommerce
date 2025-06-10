import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { clearCart, addToCart } from "@/lib/database"

// Sepeti senkronize et
export async function POST(request: Request) {
  try {
    // Token'ı al
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Token'ı doğrula
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Sepet öğelerini al
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, message: "Invalid items data" }, { status: 400 })
    }

    // Önce sepeti temizle
    await clearCart(decoded.userId)

    // Sonra yeni öğeleri ekle
    for (const item of items) {
      if (item.id && item.quantity > 0) {
        await addToCart(decoded.userId, item.id, item.quantity)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cart synchronized",
    })
  } catch (error) {
    console.error("Error in POST /api/cart/sync:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
