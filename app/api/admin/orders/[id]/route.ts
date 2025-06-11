import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("Fetching order details for ID:", params.id)

    // Sipariş detaylarını al
    const [order] = await sql`
      SELECT o.*, 
             u.first_name, u.last_name, u.email as user_email, u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${params.id}
    `

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Sipariş ürünlerini al
    const orderItems = await sql`
      SELECT oi.*, p.name as product_name, p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${params.id}
      ORDER BY oi.created_at
    `

    // Sipariş durum geçmişini al
    const statusHistory = await sql`
      SELECT osh.*, u.first_name as admin_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.created_by = u.id
      WHERE osh.order_id = ${params.id}
      ORDER BY osh.created_at DESC
    `

    // Adres bilgilerini parse et
    let customerName = "Bilinmiyor"
    let customerPhone = ""

    if (order.shipping_address) {
      try {
        const shippingAddr =
          typeof order.shipping_address === "string" ? JSON.parse(order.shipping_address) : order.shipping_address
        customerName = shippingAddr.name || `${order.first_name || ""} ${order.last_name || ""}`.trim()
        customerPhone = shippingAddr.phone || order.user_phone || ""
      } catch (e) {
        console.log("Address parsing error:", e)
      }
    }

    const orderDetail = {
      ...order,
      first_name: customerName.split(" ")[0] || "Bilinmiyor",
      last_name: customerName.split(" ").slice(1).join(" ") || "",
      user_phone: customerPhone,
      subtotal: Number.parseFloat(order.subtotal || "0"),
      total_amount: Number.parseFloat(order.total_amount || "0"),
      items: orderItems.map((item) => ({
        id: item.id,
        product_name: item.product_name || item.name || "Ürün",
        product_image: item.product_image || item.image_url || "/placeholder.svg",
        quantity: Number.parseInt(item.quantity || "1"),
        unit_price: Number.parseFloat(item.unit_price || item.price || "0"),
        total_price: Number.parseFloat(item.total_price || "0"),
        nfc_enabled: item.nfc_enabled || false,
      })),
      statusHistory: statusHistory || [],
    }

    return NextResponse.json({
      success: true,
      order: orderDetail,
    })
  } catch (error) {
    console.error(`Error in GET /api/admin/orders/${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("Updating order:", params.id)

    const body = await request.json()
    const { status, note, trackingNumber } = body

    console.log("Update data:", { status, note, trackingNumber })

    // Sipariş var mı kontrol et
    const [orderExists] = await sql`SELECT id FROM orders WHERE id = ${params.id}`
    if (!orderExists) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Siparişi güncelle
    if (status && status !== "") {
      console.log("Updating order status to:", status)

      await sql`
        UPDATE orders
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id}
      `

      // Durum geçmişine ekle
      if (note && note.trim() !== "") {
        await sql`
          INSERT INTO order_status_history (order_id, status, created_by, created_at)
          VALUES (${params.id}, ${status}, 1, CURRENT_TIMESTAMP)
        `
      }
    }

    // Kargo takip numarasını güncelle
    if (trackingNumber !== undefined) {
      console.log("Updating tracking number:", trackingNumber)

      await sql`
        UPDATE orders
        SET tracking_number = ${trackingNumber || null}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id}
      `
    }

    console.log("Order updated successfully")

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error(`Error in PUT /api/admin/orders/${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
