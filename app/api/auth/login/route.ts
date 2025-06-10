import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/database"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email ve şifre gereklidir" }, { status: 400 })
    }

    // Kullanıcıyı e-posta ile bul
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, message: "Geçersiz e-posta veya şifre" }, { status: 401 })
    }

    // Şifreyi kontrol et
    const isPasswordValid = await comparePassword(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Geçersiz e-posta veya şifre" }, { status: 401 })
    }

    // JWT token oluştur
    const token = await generateToken({ userId: user.id })

    return NextResponse.json({
      success: true,
      message: "Giriş başarılı",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 })
  }
}
