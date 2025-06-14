import { type NextRequest, NextResponse } from "next/server"
import { createOrder, createOrderItem, getOrdersByUserId, clearCart } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

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
    const userIdParam = searchParams.get("userId")
    if (userIdParam && userIdParam !== decoded.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
     
    }

    const orders = await getOrdersByUserId(decoded.userId)

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Siparişler yüklenirken hata:", error)
    return NextResponse.json({ success: false, error: "Siparişler yüklenemedi" }, { status: 500 })
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
    const { userId, items, shippingAddress, billingAddress, paymentMethod, subtotal, totalAmount } =
      await request.json()
      
   if (userId && userId !== decoded.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (!items || !shippingAddress) {
      return NextResponse.json({ success: false, error: "Gerekli alanlar eksik" }, { status: 400 })
    }

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}`
    const finalUserId = decoded.userId
    // Sipariş oluştur
    const order = await createOrder({
      user_id: finalUserId,
      order_number: orderNumber,
      subtotal,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      payment_method: paymentMethod,
    })

    // Sipariş öğelerini oluştur
    for (const item of items) {
      await createOrderItem({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        nfc_enabled: item.nfcEnabled || false,
      })
    }

    // Sepeti temizle
    await clearCart(finalUserId)

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        orderNumber,
      },
    })
  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error)
    return NextResponse.json({ success: false, error: "Sipariş oluşturulamadı" }, { status: 500 })
  }
}
