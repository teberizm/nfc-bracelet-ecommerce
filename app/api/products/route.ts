import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/database"

// API route'u dynamic olarak işaretle
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const products = await getAllProducts(limit, offset)

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    })
  } catch (error) {
    console.error("Ürünler yüklenirken hata:", error)
    return NextResponse.json({ success: false, error: "Ürünler yüklenemedi" }, { status: 500 })
  }
}
