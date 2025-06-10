import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { createUser } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    // Şifreyi hash'le
    const passwordHash = await bcrypt.hash(password, 12)

    // Kullanıcı oluştur
    const userId = uuidv4()
    const user = await createUser({
      id: userId,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      phone,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
      },
    })
  } catch (error) {
    console.error("Kayıt hatası:", error)
    return NextResponse.json({ success: false, error: "Kayıt işlemi başarısız" }, { status: 500 })
  }
}
