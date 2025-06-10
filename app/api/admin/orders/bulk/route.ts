import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

export async function PUT(request: Request) {
  try {
    // Token'ı al ve doğrula
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { orderIds, status, note } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, message: "Order IDs are required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 })
    }

    // Siparişleri toplu güncelle
    const placeholders = orderIds.map((_, index) => `$${index + 1}`).join(",")
    const updateQuery = `
      UPDATE orders
      SET status = $${orderIds.length + 1}, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
    `

    await sql.unsafe(updateQuery, ...orderIds, status)

    // Her sipariş için durum geçmişi ekle
    for (const orderId of orderIds) {
      await sql`
        INSERT INTO order_status_history (order_id, status, note, admin_id)
        VALUES (${orderId}, ${status}, ${note || null}, ${decoded.adminId})
      `
    }

    return NextResponse.json({
      success: true,
      message: `${orderIds.length} orders updated successfully`,
    })
  } catch (error) {
    console.error("Error in PUT /api/admin/orders/bulk:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
