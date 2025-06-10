import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { updateCartItemQuantity, removeFromCart } from "@/lib/database"

// Sepet öğesi miktarını güncelle
export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  try {
    const productId = params.productId

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

    // Miktar bilgisini al
    const body = await request.json()
    const { quantity } = body

    if (quantity === undefined) {
      return NextResponse.json({ success: false, message: "Quantity is required" }, { status: 400 })
    }

    // Sepet öğesi miktarını güncelle
    const updatedItem = await updateCartItemQuantity(decoded.userId, productId, quantity)

    return NextResponse.json({
      success: true,
      message: "Cart item updated",
      item: updatedItem,
    })
  } catch (error) {
    console.error("Error in PUT /api/cart/[productId]:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Sepetten ürün çıkar
export async function DELETE(request: Request, { params }: { params: { productId: string } }) {
  try {
    const productId = params.productId

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

    // Sepetten ürün çıkar
    await removeFromCart(decoded.userId, productId)

    return NextResponse.json({
      success: true,
      message: "Product removed from cart",
    })
  } catch (error) {
    console.error("Error in DELETE /api/cart/[productId]:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
