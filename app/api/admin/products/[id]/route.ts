import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Token'ı al ve doğrula
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const id = params.id
    console.log("Fetching product with ID:", id)

    // Ürün bilgilerini getir
    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
      LIMIT 1
    `

    if (products.length === 0) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const product = products[0]

    // Ürün görselleri
    const images = await sql`
      SELECT id, image_url, sort_order FROM product_images 
      WHERE product_id = ${id}
      ORDER BY sort_order
    `

    // Ürün özellikleri
    const features = await sql`
      SELECT id, feature_name, sort_order FROM product_features
      WHERE product_id = ${id}
      ORDER BY sort_order
    `

    // Ürün teknik özellikleri
    const specs = await sql`
      SELECT id, spec_name, spec_value, sort_order FROM product_specifications
      WHERE product_id = ${id}
      ORDER BY sort_order
    `

    // Veriyi düzenle
    product.images = images
    product.features = features
    product.specifications = specs

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Token'ı al ve doğrula
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    console.log("Updating product with ID:", id)

    // Ürün bilgilerini güncelle
    await sql`
      UPDATE products
      SET 
        name = ${body.name},
        description = ${body.description},
        price = ${body.price},
        original_price = ${body.originalPrice || null},
        stock = ${body.stock},
        category_id = ${body.categoryId},
        is_active = ${body.isActive},
        nfc_enabled = ${body.nfcEnabled},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Token'ı al ve doğrula
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = await verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const id = params.id
    console.log("Deleting product with ID:", id)

    // Ürünü sil (veya pasif yap)
    await sql`
      UPDATE products
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
