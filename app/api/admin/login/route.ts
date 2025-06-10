import { NextResponse } from "next/server"
import { getAdminByEmail } from "@/lib/database"
import { comparePassword, generateAdminToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Admin login attempt:", { email, password: "***" })

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email ve şifre gereklidir" }, { status: 400 })
    }

    // Admin'i e-posta ile bul
    const admin = await getAdminByEmail(email)
    console.log("Found admin:", admin ? "Yes" : "No")

    if (!admin) {
      return NextResponse.json({ success: false, message: "Geçersiz e-posta veya şifre" }, { status: 401 })
    }

    // Şifreyi kontrol et
    const isPasswordValid = await comparePassword(password, admin.password_hash)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Geçersiz e-posta veya şifre" }, { status: 401 })
    }

    // Son giriş zamanını güncelle
    await updateAdminLastLogin(admin.id)

    // JWT token oluştur
    const token = await generateAdminToken({ adminId: admin.id, role: admin.role })

    return NextResponse.json({
      success: true,
      message: "Giriş başarılı",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        created_at: admin.created_at,
        last_login: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 })
  }
}

async function updateAdminLastLogin(adminId: string) {
  try {
    await sql`
      UPDATE admins
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ${adminId}
    `
  } catch (error) {
    console.error("Error updating admin last login:", error)
  }
}
