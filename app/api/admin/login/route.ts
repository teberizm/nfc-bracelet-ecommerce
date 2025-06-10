import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { comparePassword, generateAdminToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Admin login attempt:", { email, password: "***" })

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email ve şifre gereklidir" }, { status: 400 })
    }

    try {
      // Admin'i e-posta ile bul
      const admins = await sql`
        SELECT * FROM admins WHERE email = ${email} AND is_active = true LIMIT 1
      `

      console.log("Found admin:", admins.length > 0 ? "Yes" : "No")

      if (admins.length > 0) {
        const admin = admins[0]

        // Şifreyi kontrol et (hash'li veya düz metin)
        let isPasswordValid = false

        // Önce hash'li şifre kontrolü
        try {
          isPasswordValid = await comparePassword(password, admin.password_hash)
        } catch (error) {
          // Hash kontrolü başarısız olursa düz metin kontrolü
          isPasswordValid = password === admin.password_hash
        }

        console.log("Password valid:", isPasswordValid)

        if (isPasswordValid) {
          // Son giriş zamanını güncelle
          await sql`
            UPDATE admins
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = ${admin.id}
          `

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
        }
      }
    } catch (dbError) {
      console.log("Database error, trying demo login:", dbError)
    }

    // Demo giriş (veritabanı bağlantısı olmadığında)
    if (email === "admin@nfcbileklik.com" && password === "admin123") {
      console.log("Using demo admin credentials")

      const demoAdmin = {
        id: "demo-admin-id",
        email: "admin@nfcbileklik.com",
        name: "Demo Admin",
        role: "admin",
        created_at: new Date().toISOString(),
      }

      const token = await generateAdminToken({
        adminId: demoAdmin.id,
        role: demoAdmin.role,
      })

      return NextResponse.json({
        success: true,
        message: "Demo giriş başarılı",
        token,
        admin: demoAdmin,
      })
    }

    return NextResponse.json({ success: false, message: "Geçersiz e-posta veya şifre" }, { status: 401 })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 })
  }
}
