import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-this-in-production"

// Şifre hashleme
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Şifre karşılaştırma
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// User JWT token oluşturma
export async function generateToken(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 gün geçerli
    .sign(secret)

  return token
}

// User JWT token doğrulama
export async function verifyToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Admin JWT token oluşturma
export async function generateAdminToken(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(ADMIN_JWT_SECRET)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // 24 saat geçerli (admin için daha kısa)
    .sign(secret)

  return token
}

// Admin JWT token doğrulama
export async function verifyAdminToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(ADMIN_JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Admin token verification error:", error)
    return null
  }
}

// Eski fonksiyonlar (geriye dönük uyumluluk için)
export async function login(email: string, password: string): Promise<boolean> {
  // Bu fonksiyon artık kullanılmıyor, API route'ları kullanılıyor
  console.warn("Deprecated: Use API routes instead")
  return false
}

export async function logout(): Promise<void> {
  // Bu fonksiyon artık kullanılmıyor, context'ler kullanılıyor
  console.warn("Deprecated: Use context logout instead")
}

export function getCurrentUser() {
  // Bu fonksiyon artık kullanılmıyor, context'ler kullanılıyor
  console.warn("Deprecated: Use auth context instead")
  return null
}

export function isAuthenticated(): boolean {
  // Bu fonksiyon artık kullanılmıyor, context'ler kullanılıyor
  console.warn("Deprecated: Use auth context instead")
  return false
}
