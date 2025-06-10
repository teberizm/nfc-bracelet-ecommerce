import { NextResponse } from "next/server"
import { getUserByEmail, createUser } from "@/lib/database"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name, phone } = body

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ success: false, message: "Tüm gerekli alanları doldurun" }, { status: 400 })
    }

    // E-posta adresi zaten kullanılıyor mu kontrol et
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Bu e-posta adresi zaten kullanılıyor" }, { status: 409 })
    }

    // Şifreyi hashle
    const password_hash = await hashPassword(password)

    // Kullanıcıyı oluştur
    const newUser = await createUser({
      email,
      password_hash,
      first_name,
      last_name,
      phone: phone || null,
    })

    // JWT token oluştur
    const token = await generateToken({ userId: newUser.id })

    return NextResponse.json({
      success: true,
      message: "Kayıt başarılı",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone: newUser.phone,
        created_at: newUser.created_at,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 })
  }
}
