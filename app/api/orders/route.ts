import { type NextRequest, NextResponse } from "next/server"
import { createOrder, createOrderItem, getOrdersByUserId, clearCart } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Kullanıcı ID gerekli" }, { status: 400 })
    }

    const orders = await getOrdersByUserId(userId)

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
    const { userId, items, shippingAddress, billingAddress, paymentMethod, subtotal, totalAmount } =
      await request.json()

    if (!userId || !items || !shippingAddress) {
      return NextResponse.json({ success: false, error: "Gerekli alanlar eksik" }, { status: 400 })
    }

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}`

    // Sipariş oluştur
    const order = await createOrder({
      user_id: userId,
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
    await clearCart(userId)

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
