import { NextResponse } from "next/server"
import { sql, updateCustomDesignOrder } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [order] = await sql`
      SELECT cdo.*, u.first_name, u.last_name, u.email as user_email, u.phone as user_phone
      FROM custom_design_orders cdo
      JOIN users u ON cdo.user_id = u.id
      WHERE cdo.id = ${params.id}
      LIMIT 1
    `

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Error fetching custom design order:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1) JSON parse hatalarını yakalayıp 400 dönüyoruz
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    )
  }

  // 2) Geçerli body ile devam edip güncelleme alanlarını topluyoruz
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
        { status: 400 }
      )
    }
  }

  // 3) Hiç alan yoksa No updates provided
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, message: "No updates provided" },
      { status: 400 }
    )
  }

  // 4) Güncelleme işlemi
  try {
    const updated = await updateCustomDesignOrder(params.id, updates)
    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error("Error updating custom design order:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
