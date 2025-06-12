import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const orders = await sql`
      SELECT cdo.*, u.first_name, u.last_name, u.email as user_email
      FROM custom_design_orders cdo
      JOIN users u ON cdo.user_id = u.id
      ORDER BY cdo.created_at DESC
    `

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("Error fetching custom design orders:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}