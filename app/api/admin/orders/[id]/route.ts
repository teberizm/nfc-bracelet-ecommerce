import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sipariş detaylarını al
    const [order] = await sql`
      SELECT * FROM orders WHERE id = ${params.id}
    `

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Kullanıcı bilgilerini al
    let customerInfo = { first_name: "Bilinmiyor", last_name: "", email: "", phone: "" }
    if (order.user_id) {
      const [user] = await sql`SELECT * FROM users WHERE id = ${order.user_id}`
      if (user) {
        customerInfo = {
          first_name: user.first_name || "Bilinmiyor",
          last_name: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
        }
      }
    }

    // Adres bilgilerini parse et
    let shippingAddress = null
    if (order.shipping_address) {
      try {
        shippingAddress =
          typeof order.shipping_address === "string" ? JSON.parse(order.shipping_address) : order.shipping_address

        // Adres bilgisinden isim ve telefon al
        if (shippingAddress.name) {
          const nameParts = shippingAddress.name.split(" ")
          customerInfo.first_name = nameParts[0] || "Bilinmiyor"
          customerInfo.last_name = nameParts.slice(1).join(" ") || ""
        }
        if (shippingAddress.phone) {
          customerInfo.phone = shippingAddress.phone
        }
      } catch (e) {
        console.log("Address parsing error:", e)
      }
    }

    // Sipariş ürünlerini al (basit sorgu)
    const orderItems = await sql`
      SELECT * FROM order_items WHERE order_id = ${params.id}
    `

    // Durum geçmişini al
    const statusHistory = await sql`
      SELECT * FROM order_status_history WHERE order_id = ${params.id} ORDER BY created_at DESC
    `

    const orderDetail = {
      ...order,
      ...customerInfo,
      user_email: customerInfo.email,
      user_phone: customerInfo.phone,
      subtotal: Number.parseFloat(order.subtotal || "0"),
      total_amount: Number.parseFloat(order.total_amount || "0"),
      items: orderItems.map((item) => ({
        id: item.id,
        product_name: item.product_name || item.name || "Ürün",
        product_image: "/placeholder.svg?height=64&width=64",
        quantity: Number.parseInt(item.quantity || "1"),
        unit_price: Number.parseFloat(item.unit_price || item.price || "0"),
        total_price: Number.parseFloat(item.total_price || "0"),
        nfc_enabled: item.nfc_enabled || false,
      })),
      statusHistory: statusHistory || [],
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
    }

    return NextResponse.json({
      success: true,
      order: orderDetail,
    })
  } catch (error) {
    console.error(`Error in GET /api/admin/orders/${params.id}:`, error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, note, trackingNumber } = body

    // Sipariş var mı kontrol et
    const [orderExists] = await sql`SELECT id FROM orders WHERE id = ${params.id}`
    if (!orderExists) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Siparişi güncelle
    if (status) {
      await sql`
        UPDATE orders
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id}
      `

      // Durum geçmişine ekle
      await sql`
        INSERT INTO order_status_history (order_id, status, created_by, created_at)
        VALUES (${params.id}, ${status}, 1, CURRENT_TIMESTAMP)
      `
    }

    // Kargo takip numarasını güncelle
    if (trackingNumber !== undefined) {
      await sql`
        UPDATE orders
        SET tracking_number = ${trackingNumber || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id}
      `
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error(`Error in PUT /api/admin/orders/${params.id}:`, error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
