import { NextResponse } from "next/server"
import { sql, updateCustomDesignOrder } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    const [order] = await sql`
       SELECT cdo.*, u.first_name, u.last_name, u.email as user_email, u.phone as user_phone
      FROM custom_design_orders cdo
      JOIN users u ON cdo.user_id = u.id
      WHERE cdo.id = ${params.id}
      LIMIT 1
    `

    if (!order) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error fetching custom design order:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }
    const body = await request.json()
    const updates: any = {}
    if (body.status) updates.status = body.status
    if (body.payment_status) updates.payment_status = body.payment_status
    if (typeof body.price !== "undefined") {
      const parsed =
        body.price === null
          ? null
          : Number.parseFloat(String(body.price).replace(",", "."))
      if (!Number.isNaN(parsed as number) || parsed === null) {
        updates.price = parsed
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid price" },
          { status: 400 },
        )
      }
    }

    const updated = await updateCustomDesignOrder(params.id, updates)
    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error("Error updating custom design order:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}