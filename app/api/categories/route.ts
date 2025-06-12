import { NextResponse } from "next/server"
import { getAllCategories } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (err) {
    console.error("❌ Kategori çekme hatası:", err)
    return NextResponse.json({ error: "Kategori yüklenemedi" }, { status: 500 })
  }
}