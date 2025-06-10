import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getCartItems, addToCart, clearCart } from "@/lib/database"

// Sepet öğelerini getir
export async function GET(request: Request) {
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
    const cartItems = await getCartItems(decoded.userId)

    return NextResponse.json({
      success: true,
      items: cartItems,
    })
  } catch (error) {
    console.error("Error in GET /api/cart:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Sepete ürün ekle
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

    // Ürün bilgilerini al
    const body = await request.json()
    const { product_id, quantity = 1 } = body

    if (!product_id) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }

    // Sepete ürün ekle
    const cartItem = await addToCart(decoded.userId, product_id, quantity)

    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      item: cartItem,
    })
  } catch (error) {
    console.error("Error in POST /api/cart:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Sepeti temizle
export async function DELETE(request: Request) {
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

    // Sepeti temizle
    await clearCart(decoded.userId)

    return NextResponse.json({
      success: true,
      message: "Cart cleared",
    })
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
