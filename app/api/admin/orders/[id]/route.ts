import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sipariş detaylarını al
    const [order] = await sql`
      SELECT o.*, 
             u.first_name, u.last_name, u.email as user_email, u.phone as user_phone,
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', oi.product_name,
                 'product_image', oi.product_image,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total_price', oi.total_price,
                 'nfc_enabled', oi.nfc_enabled
               ) ORDER BY oi.created_at
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${params.id}
      GROUP BY o.id, u.id
    `

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Sipariş durum geçmişini al
    const statusHistory = await sql`
      SELECT * FROM order_status_history
      WHERE order_id = ${params.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        statusHistory,
      },
    })
  } catch (error) {
    console.error(`Error in /api/admin/orders/${params.id}:`, error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
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
        INSERT INTO order_status_history (order_id, status, note, admin_id)
        VALUES (${params.id}, ${status}, ${note || null}, 1)
      `
    }

    // Kargo takip numarasını güncelle
    if (trackingNumber !== undefined) {
      await sql`
        UPDATE orders
        SET tracking_number = ${trackingNumber}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id}
      `
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error(`Error in PUT /api/admin/orders/${params.id}:`, error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
