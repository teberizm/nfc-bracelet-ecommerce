import { NextResponse } from "next/server"
import { getUserById } from "@/lib/database"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function PUT(request: Request) {
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

    // Kullanıcı bilgilerini al
    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Güncellenecek verileri al
    const body = await request.json()
    const { first_name, last_name, phone, address } = body

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await sql`
      UPDATE users
      SET 
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        phone = COALESCE(${phone}, phone),
        address = COALESCE(${JSON.stringify(address)}, address),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${decoded.userId}
      RETURNING id, email, first_name, last_name, phone, address, created_at
    `

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser[0],
    })
  } catch (error) {
    console.error("Error in /api/auth/profile:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
